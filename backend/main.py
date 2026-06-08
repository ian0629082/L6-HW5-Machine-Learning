from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os

from database import get_db_connection, init_db
from algorithms_data import ALGORITHMS

app = FastAPI(title="ML Algorithms Learning API")

# Setup CORS so Next.js frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Models
class NoteUpdate(BaseModel):
    content: str

class ProgressUpdate(BaseModel):
    study_completed: Optional[bool] = None
    quiz_completed: Optional[bool] = None
    playground_completed: Optional[bool] = None

class QuizSubmission(BaseModel):
    answers: Dict[int, int]  # quiz_id -> selected_option_index

# API Routes

@app.get("/api/algorithms")
def get_algorithms():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM progress")
    rows = cursor.fetchall()
    conn.close()
    
    progress_dict = {row["algorithm_id"]: dict(row) for row in rows}
    
    result = []
    for alg_id, alg in ALGORITHMS.items():
        # Get progress from db or use default
        prog = progress_dict.get(alg_id, {
            "study_completed": 0,
            "quiz_completed": 0,
            "playground_completed": 0
        })
        
        result.append({
            "id": alg["id"],
            "name": alg["name"],
            "type": alg["type"],
            "usage": alg["usage"],
            "idea": alg["idea"],
            "study_completed": bool(prog.get("study_completed", 0)),
            "quiz_completed": bool(prog.get("quiz_completed", 0)),
            "playground_completed": bool(prog.get("playground_completed", 0))
        })
    return result

@app.get("/api/algorithms/{id}")
def get_algorithm_detail(id: str):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    # Get algorithm detail
    alg = ALGORITHMS[id].copy()
    
    # Retrieve notes and progress
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Notes
    cursor.execute("SELECT content FROM notes WHERE algorithm_id = ?", (id,))
    note_row = cursor.fetchone()
    notes_content = note_row["content"] if note_row else ""
    
    # Progress
    cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (id,))
    prog_row = cursor.fetchone()
    progress = dict(prog_row) if prog_row else {
        "study_completed": 0,
        "quiz_completed": 0,
        "playground_completed": 0
    }
    
    conn.close()
    
    alg["notes"] = notes_content
    alg["progress"] = {
        "study_completed": bool(progress.get("study_completed", 0)),
        "quiz_completed": bool(progress.get("quiz_completed", 0)),
        "playground_completed": bool(progress.get("playground_completed", 0))
    }
    
    # Remove quizzes from algorithm detail, they are loaded separately via /quiz
    if "quizzes" in alg:
        del alg["quizzes"]
        
    return alg

@app.post("/api/algorithms/{id}/notes")
def update_notes(id: str, note: NoteUpdate):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO notes (algorithm_id, content, last_updated) VALUES (?, ?, CURRENT_TIMESTAMP)",
        (id, note.content)
    )
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Note updated"}

@app.post("/api/algorithms/{id}/progress")
def update_progress(id: str, progress: ProgressUpdate):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch current progress
    cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (id,))
    row = cursor.fetchone()
    
    study_completed = 1 if progress.study_completed else (row["study_completed"] if row and progress.study_completed is None else 0)
    quiz_completed = 1 if progress.quiz_completed else (row["quiz_completed"] if row and progress.quiz_completed is None else 0)
    playground_completed = 1 if progress.playground_completed else (row["playground_completed"] if row and progress.playground_completed is None else 0)
    
    cursor.execute(
        "INSERT OR REPLACE INTO progress (algorithm_id, study_completed, quiz_completed, playground_completed, last_updated) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
        (id, study_completed, quiz_completed, playground_completed)
    )
    conn.commit()
    conn.close()
    return {
        "status": "success", 
        "progress": {
            "study_completed": bool(study_completed),
            "quiz_completed": bool(quiz_completed),
            "playground_completed": bool(playground_completed)
        }
    }

@app.get("/api/algorithms/{id}/quiz")
def get_algorithm_quiz(id: str):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    quizzes = ALGORITHMS[id]["quizzes"]
    # Return questions without answers
    quiz_questions = []
    for q in quizzes:
        quiz_questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"]
        })
    return quiz_questions

@app.post("/api/algorithms/{id}/quiz/grade")
def grade_algorithm_quiz(id: str, submission: QuizSubmission):
    if id not in ALGORITHMS:
        raise HTTPException(status_code=404, detail="Algorithm not found")
        
    quizzes = ALGORITHMS[id]["quizzes"]
    results = []
    correct_count = 0
    
    for q in quizzes:
        q_id = q["id"]
        user_answer = submission.answers.get(q_id)
        is_correct = (user_answer == q["answer"])
        if is_correct:
            correct_count += 1
            
        results.append({
            "id": q_id,
            "question": q["question"],
            "user_answer": user_answer,
            "correct_answer": q["answer"],
            "is_correct": is_correct,
            "explanation": q["explanation"]
        })
        
    score = int((correct_count / len(quizzes)) * 100)
    
    # If score is >= 60, mark quiz_completed = 1
    quiz_completed = 0
    if score >= 60:
        quiz_completed = 1
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if progress exists
        cursor.execute("SELECT * FROM progress WHERE algorithm_id = ?", (id,))
        row = cursor.fetchone()
        
        study_completed = row["study_completed"] if row else 0
        playground_completed = row["playground_completed"] if row else 0
        
        cursor.execute(
            "INSERT OR REPLACE INTO progress (algorithm_id, study_completed, quiz_completed, playground_completed, last_updated) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
            (id, study_completed, 1, playground_completed)
        )
        conn.commit()
        conn.close()
        
    return {
        "score": score,
        "passed": score >= 60,
        "results": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
