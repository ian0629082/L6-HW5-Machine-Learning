"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

interface AlgorithmDetail {
  id: string;
  name: string;
  type: string;
  usage: string;
  idea: string;
  data_type: string;
  concept: string;
  workflow: string[];
  examples: string;
  pros_cons: {
    pros: string[];
    cons: string[];
    mistakes: string;
  };
  study_advice: string;
  notes: string;
  progress: {
    study_completed: boolean;
    quiz_completed: boolean;
    playground_completed: boolean;
  };
  interactive_type: string;
  interactive_params: any;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  results: {
    id: number;
    question: string;
    user_answer: number;
    correct_answer: number;
    is_correct: boolean;
    explanation: string;
  }[];
}

export default function AlgorithmPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [data, setData] = useState<AlgorithmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"study" | "playground" | "quiz">("study");

  // Notes state
  const [notesText, setNotesText] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesStatus, setNotesStatus] = useState("");

  // Quiz state
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Dict<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // Playground state variables
  // Linear Regression
  const [slope, setSlope] = useState(1.5);
  const [intercept, setIntercept] = useState(2.0);
  // Logistic Regression
  const [threshold, setThreshold] = useState(0.5);
  // Decision Tree
  const [treeAnswers, setTreeAnswers] = useState<Dict<string, string>>({});
  // Random Forest
  const [forestVoting, setForestVoting] = useState(false);
  const [forestResult, setForestResult] = useState<string | null>(null);
  const [forestVotes, setForestVotes] = useState<number[]>([]);
  // SVM
  const [svmC, setSvmC] = useState(1.0);
  const [svmLineAngle, setSvmLineAngle] = useState(45);
  // KNN
  const [knnK, setKnnK] = useState(3);
  const [knnTestPoint, setKnnTestPoint] = useState<{ x: number; y: number } | null>(null);
  const [knnLabelResult, setKnnLabelResult] = useState<string | null>(null);
  // Naive Bayes
  const [nbText, setNbText] = useState("免費 中獎 會議");
  // K-Means
  const [kmeansStep, setKmeansStep] = useState(0);
  const [centroids, setCentroids] = useState<{ x: number; y: number; color: string }[]>([
    { x: 2.0, y: 2.0, color: "#ef4444" },
    { x: 3.5, y: 3.5, color: "#3b82f6" },
    { x: 1.5, y: 4.5, color: "#22c55e" }
  ]);
  // PCA
  const [pcaAngle, setPcaAngle] = useState(30);
  // Neural Network
  const [nnWeights, setNnWeights] = useState({
    w11: 0.8, w12: -0.2, w21: 0.4, w22: 0.9, v11: 0.5, v21: -0.6
  });
  const [nnOutputs, setNnOutputs] = useState<number[] | null>(null);

  useEffect(() => {
    fetchAlgorithmDetail();
    fetchQuiz();
  }, [id]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchAlgorithmDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/algorithms/${id}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setNotesText(result.notes || "");
      }
    } catch (err) {
      console.error("Error fetching algorithm detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`${apiBase}/api/algorithms/${id}/quiz`);
      if (res.ok) {
        const quizData = await res.json();
        setQuizzes(quizData);
        setSelectedAnswers({});
        setQuizResult(null);
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
    }
  };

  const triggerSidebarRefresh = () => {
    window.dispatchEvent(new Event("progressUpdated"));
  };

  const handleStudyCompleted = async () => {
    if (!data) return;
    try {
      const res = await fetch(`${apiBase}/api/algorithms/${id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ study_completed: true })
      });
      if (res.ok) {
        const progressRes = await res.json();
        setData({
          ...data,
          progress: progressRes.progress
        });
        triggerSidebarRefresh();
      }
    } catch (err) {
      console.error("Error updating study progress:", err);
    }
  };

  const handlePlaygroundCompleted = async () => {
    if (!data || data.progress.playground_completed) return;
    try {
      const res = await fetch(`${apiBase}/api/algorithms/${id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playground_completed: true })
      });
      if (res.ok) {
        const progressRes = await res.json();
        setData({
          ...data,
          progress: progressRes.progress
        });
        triggerSidebarRefresh();
      }
    } catch (err) {
      console.error("Error updating playground progress:", err);
    }
  };

  const saveNotes = async () => {
    setNotesSaving(true);
    setNotesStatus("");
    try {
      const res = await fetch(`${apiBase}/api/algorithms/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: notesText })
      });
      if (res.ok) {
        setNotesStatus("已儲存 ⚡");
        setTimeout(() => setNotesStatus(""), 3000);
      } else {
        setNotesStatus("儲存失敗 ❌");
      }
    } catch (err) {
      console.error("Error saving notes:", err);
      setNotesStatus("儲存失敗 ❌");
    } finally {
      setNotesSaving(false);
    }
  };

  const submitQuiz = async () => {
    // Check all questions answered
    if (Object.keys(selectedAnswers).length < quizzes.length) {
      alert("請回答所有測驗題目後再送出！");
      return;
    }
    setQuizLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/algorithms/${id}/quiz/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers })
      });
      if (res.ok) {
        const result = await res.json();
        setQuizResult(result);
        if (result.passed && data) {
          setData({
            ...data,
            progress: {
              ...data.progress,
              quiz_completed: true
            }
          });
          triggerSidebarRefresh();
        }
      }
    } catch (err) {
      console.error("Error grading quiz:", err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Interactive playground logic solvers
  // 1. Linear Regression
  const calculateRegressionRSS = () => {
    if (!data?.interactive_params?.points) return 0;
    let rss = 0;
    data.interactive_params.points.forEach((p: any) => {
      const predY = slope * p.x + intercept;
      rss += Math.pow(p.y - predY, 2);
    });
    return parseFloat(rss.toFixed(3));
  };

  // 2. Logistic Regression
  const getLogisticAccuracy = () => {
    if (!data?.interactive_params?.points) return 0;
    let correct = 0;
    const points = data.interactive_params.points;
    points.forEach((p: any) => {
      // z = score, S(z) = 1 / (1 + e^-z)
      const prob = 1 / (1 + Math.exp(-p.score));
      const pred = prob >= threshold ? 1 : 0;
      if (pred === p.label) correct++;
    });
    return Math.round((correct / points.length) * 100);
  };

  // 4. Random Forest Voting Simulation
  const runForestVoting = () => {
    setForestVoting(true);
    setForestResult(null);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const currentVotes = Array.from({ length: 5 }, () => (Math.random() > 0.4 ? 1 : 0));
      setForestVotes(currentVotes);
      if (step >= 5) {
        clearInterval(interval);
        const ones = currentVotes.filter(v => v === 1).length;
        const consensus = ones >= 3 ? "購買 (Consensus: Buy)" : "不購買 (Consensus: Don't Buy)";
        setForestResult(consensus);
        setForestVoting(false);
        handlePlaygroundCompleted();
      }
    }, 300);
  };

  // 6. KNN Solver
  const handleKnnClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 4).toFixed(2));
    const y = parseFloat((4 - (e.clientY - rect.top) / rect.height * 4).toFixed(2));
    
    setKnnTestPoint({ x, y });

    // Solve KNN
    if (!data?.interactive_params?.points) return;
    const points = data.interactive_params.points;
    const distances = points.map((p: any) => {
      const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
      return { ...p, dist };
    });

    distances.sort((a: any, b: any) => a.dist - b.dist);
    const nearest = distances.slice(0, knnK);
    
    // Majority vote
    const counts = nearest.reduce((acc: any, curr: any) => {
      acc[curr.label] = (acc[curr.label] || 0) + 1;
      return acc;
    }, {});

    const maxLabel = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    setKnnLabelResult(maxLabel);
    handlePlaygroundCompleted();
  };

  // 7. Naive Bayes Calculator
  const getBayesSpamProbability = () => {
    if (!data?.interactive_params?.vocabulary) return 0.5;
    const vocab = data.interactive_params.vocabulary;
    const p_spam_prior = data.interactive_params.spam_prior;
    const p_ham_prior = data.interactive_params.ham_prior;
    
    const words = nbText.trim().split(/\s+/);
    
    let p_words_spam = 1.0;
    let p_words_ham = 1.0;

    words.forEach(w => {
      if (vocab[w]) {
        p_words_spam *= vocab[w].spam;
        p_words_ham *= vocab[w].ham;
      } else {
        // Laplace smoothing mock
        p_words_spam *= 0.05;
        p_words_ham *= 0.05;
      }
    });

    const numerator = p_words_spam * p_spam_prior;
    const denominator = numerator + (p_words_ham * p_ham_prior);
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  };

  // 8. K-Means Simulation Step
  const runKmeansStep = () => {
    if (!data?.interactive_params?.points) return;
    const points = data.interactive_params.points;
    
    if (kmeansStep === 0) {
      // Step 1: Assign points to nearest centroid
      setKmeansStep(1);
      handlePlaygroundCompleted();
    } else if (kmeansStep === 1) {
      // Step 2: Recalculate centroids
      // Group points by nearest centroid and compute average
      const mockGroups: Record<string, { x: number; y: number }[]> = {
        "#ef4444": [], "#3b82f6": [], "#22c55e": []
      };

      points.forEach((p: any) => {
        // Find nearest centroid
        let minDist = Infinity;
        let nearestColor = "#ef4444";
        centroids.forEach(c => {
          const dist = Math.sqrt(Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
          if (dist < minDist) {
            minDist = dist;
            nearestColor = c.color;
          }
        });
        if (mockGroups[nearestColor]) {
          mockGroups[nearestColor].push(p);
        }
      });

      // Update centroids to averages
      const newCentroids = centroids.map(c => {
        const group = mockGroups[c.color] || [];
        if (group.length === 0) return c;
        const avgX = group.reduce((sum, p) => sum + p.x, 0) / group.length;
        const avgY = group.reduce((sum, p) => sum + p.y, 0) / group.length;
        return { ...c, x: parseFloat(avgX.toFixed(2)), y: parseFloat(avgY.toFixed(2)) };
      });

      setCentroids(newCentroids);
      setKmeansStep(2); // Show Converged
    } else {
      // Reset
      setCentroids([
        { x: 2.0, y: 2.0, color: "#ef4444" },
        { x: 3.5, y: 3.5, color: "#3b82f6" },
        { x: 1.5, y: 4.5, color: "#22c55e" }
      ]);
      setKmeansStep(0);
    }
  };

  // 9. PCA Projection Solver
  const getPcaVariance = () => {
    // Variance is maximized when angle aligns with data covariance.
    // Our data points lie roughly along x = 2y (angle approx 26.5 deg)
    const rad = (pcaAngle * Math.PI) / 180;
    const points = [
      {x: -2.0, y: -1.0}, {x: -1.5, y: -0.8}, {x: -1.0, y: -0.5},
      {x: 0.0, y: 0.0}, {x: 1.0, y: 0.5}, {x: 1.5, y: 0.8},
      {x: 2.0, y: 1.0}, {x: -0.5, y: -0.2}, {x: 0.5, y: 0.2}
    ];

    // Compute projection lengths: proj = x*cos(theta) + y*sin(theta)
    let sumSquaredProj = 0;
    points.forEach(p => {
      const proj = p.x * Math.cos(rad) + p.y * Math.sin(rad);
      sumSquaredProj += Math.pow(proj, 2);
    });

    const varianceVal = sumSquaredProj / points.length;
    return parseFloat(varianceVal.toFixed(3));
  };

  // 10. Neural Network Solver
  const runNnForward = () => {
    // inputs: [x1, x2] = [1.0, -0.5]
    const x1 = 1.0;
    const x2 = -0.5;

    // hidden layer:
    // h1 = sigmoid(w11*x1 + w12*x2 + b1)
    // h2 = sigmoid(w21*x1 + w22*x2 + b2)
    const z1 = nnWeights.w11 * x1 + nnWeights.w12 * x2 + 0.1;
    const z2 = nnWeights.w21 * x1 + nnWeights.w22 * x2 + 0.2;
    const h1 = 1 / (1 + Math.exp(-z1));
    const h2 = 1 / (1 + Math.exp(-z2));

    // output layer:
    // y = sigmoid(v11*h1 + v21*h2 + b3)
    const z3 = nnWeights.v11 * h1 + nnWeights.v21 * h2 - 0.3;
    const y = 1 / (1 + Math.exp(-z3));

    setNnOutputs([
      parseFloat(h1.toFixed(3)), 
      parseFloat(h2.toFixed(3)), 
      parseFloat(y.toFixed(3))
    ]);
    handlePlaygroundCompleted();
  };

  if (loading || !data) {
    return (
      <div className="loading-container">
        <p>載入演算法內容中...</p>
      </div>
    );
  }

  // Render different Interactive Playgrounds
  const renderPlayground = () => {
    switch (data.interactive_type) {
      case "regression_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 線性迴歸直線擬合演練</h3>
            <p className="widget-desc">
              拖動下方滑桿調整線段的斜率 (Slope) 與截距 (Intercept)，試著降低<b>殘差平方和 (RSS)</b>。
              當您成功擬合時，會解鎖此 Playground 進度！
            </p>
            
            <div className="playground-layout">
              <div className="control-panel">
                <div className="slider-group">
                  <label>斜率 (Slope w₁): {slope.toFixed(2)}</label>
                  <input 
                    type="range" min="-1" max="4" step="0.05" value={slope} 
                    onChange={(e) => {
                      setSlope(parseFloat(e.target.value));
                      handlePlaygroundCompleted();
                    }}
                  />
                </div>
                <div className="slider-group">
                  <label>截距 (Intercept b): {intercept.toFixed(2)}</label>
                  <input 
                    type="range" min="-2" max="6" step="0.1" value={intercept} 
                    onChange={(e) => {
                      setIntercept(parseFloat(e.target.value));
                      handlePlaygroundCompleted();
                    }}
                  />
                </div>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>當前殘差平方和 (RSS):</span>
                    <span className="stat-code-val">{calculateRegressionRSS()}</span>
                  </div>
                  <div className="stat-row">
                    <span>最佳極小 RSS 參考:</span>
                    <span className="stat-success-val">~ 1.15</span>
                  </div>
                </div>
              </div>

              <div className="visual-panel">
                {/* SVG Graph */}
                <svg width="100%" height="280" viewBox="0 0 300 200" style={{ background: "#0b0f19", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="180" x2="300" y2="180" stroke="#334155" strokeWidth="2" />
                  <line x1="20" y1="0" x2="20" y2="200" stroke="#334155" strokeWidth="2" />
                  
                  {/* Points */}
                  {data.interactive_params.points.map((p: any, idx: number) => {
                    const cx = 20 + p.x * 30;
                    const cy = 180 - p.y * 12;
                    return (
                      <circle key={idx} cx={cx} cy={cy} r="5" fill="#3b82f6" />
                    );
                  })}

                  {/* Fitting Line: y = slope * x + intercept */}
                  {/* x=0 -> y=intercept */}
                  {/* x=9 -> y=slope*9 + intercept */}
                  <line 
                    x1="20" 
                    y1={180 - (intercept * 12)} 
                    x2={20 + 9 * 30} 
                    y2={180 - ((slope * 9 + intercept) * 12)} 
                    stroke="#22c55e" 
                    strokeWidth="3" 
                  />
                </svg>
              </div>
            </div>
          </div>
        );

      case "logistic_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 邏輯斯迴歸機率閾值演練</h3>
            <p className="widget-desc">
              調整分類概率閾值 (Threshold)，觀察預測準確率與混淆矩陣的變化。
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <div className="slider-group">
                  <label>分類門檻 (Threshold): {threshold.toFixed(2)}</label>
                  <input 
                    type="range" min="0.05" max="0.95" step="0.05" value={threshold} 
                    onChange={(e) => {
                      setThreshold(parseFloat(e.target.value));
                      handlePlaygroundCompleted();
                    }}
                  />
                </div>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>預測正確率 (Accuracy):</span>
                    <span className="stat-code-val">{getLogisticAccuracy()}%</span>
                  </div>
                </div>
              </div>

              <div className="visual-panel">
                <svg width="100%" height="280" viewBox="0 0 350 200" style={{ background: "#0b0f19", borderRadius: "8px" }}>
                  {/* X Axis */}
                  <line x1="20" y1="100" x2="330" y2="100" stroke="#334155" />
                  
                  {/* Threshold line */}
                  {/* Threshold maps to x score z. S(z) = threshold -> z = -ln(1/threshold - 1) */}
                  {/* We just draw threshold line at y */}
                  <line x1="20" y1={200 - threshold * 200} x2="330" y2={200 - threshold * 200} stroke="#ef4444" strokeDasharray="4" />
                  <text x="30" y={200 - threshold * 200 - 5} fill="#ef4444" fontSize="10">門檻: {threshold}</text>

                  {/* Sigmoid curve */}
                  <path 
                    d={Array.from({ length: 300 }, (_, i) => {
                      const x = 20 + i;
                      const score = ((x - 175) / 150) * 8; // Score from -4 to 4
                      const prob = 1 / (1 + Math.exp(-score));
                      const y = 200 - prob * 200;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="3"
                  />

                  {/* Points */}
                  {data.interactive_params.points.map((p: any, idx: number) => {
                    const prob = 1 / (1 + Math.exp(-p.score));
                    const cx = 175 + (p.score / 8) * 300;
                    const cy = 200 - prob * 200;
                    const isPred1 = prob >= threshold;
                    const isCorrect = (isPred1 ? 1 : 0) === p.label;
                    return (
                      <circle 
                        key={idx} 
                        cx={cx} 
                        cy={cy} 
                        r="6" 
                        fill={p.label === 1 ? "#3b82f6" : "#f59e0b"} 
                        stroke={isCorrect ? "#22c55e" : "#ef4444"} 
                        strokeWidth="2" 
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        );

      case "tree_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 決策樹互動推理模擬</h3>
            <p className="widget-desc">
              點選條件分支，體驗決策樹是如何根據屬性進行分流與最終的預測。
            </p>

            <div className="tree-flow-container">
              <div className="glass-panel tree-question-card">
                <h4>節點 1：年齡是否大於 30 歲？</h4>
                <div className="btn-group">
                  <button 
                    className={`mini-btn ${treeAnswers.age === "yes" ? "active" : ""}`}
                    onClick={() => {
                      setTreeAnswers({ ...treeAnswers, age: "yes", result: "" });
                      handlePlaygroundCompleted();
                    }}
                  >
                    是 (Yes)
                  </button>
                  <button 
                    className={`mini-btn ${treeAnswers.age === "no" ? "active" : ""}`}
                    onClick={() => {
                      setTreeAnswers({ ...treeAnswers, age: "no", result: "" });
                      handlePlaygroundCompleted();
                    }}
                  >
                    否 (No)
                  </button>
                </div>
              </div>

              {treeAnswers.age === "yes" && (
                <div className="glass-panel tree-question-card fade-in">
                  <h4>節點 2：年收入是否高於 50 萬？</h4>
                  <div className="btn-group">
                    <button 
                      className={`mini-btn ${treeAnswers.income === "yes" ? "active" : ""}`}
                      onClick={() => setTreeAnswers({ ...treeAnswers, income: "yes", result: "預測結果：會購買 🛍️ (100% 信心度)" })}
                    >
                      是 (Yes)
                    </button>
                    <button 
                      className={`mini-btn ${treeAnswers.income === "no" ? "active" : ""}`}
                      onClick={() => setTreeAnswers({ ...treeAnswers, income: "no", result: "預測結果：不購買 ❌" })}
                    >
                      否 (No)
                    </button>
                  </div>
                </div>
              )}

              {treeAnswers.age === "no" && (
                <div className="glass-panel tree-question-card fade-in">
                  <h4>節點 2：是否為舊會員？</h4>
                  <div className="btn-group">
                    <button 
                      className={`mini-btn ${treeAnswers.member === "yes" ? "active" : ""}`}
                      onClick={() => setTreeAnswers({ ...treeAnswers, member: "yes", result: "預測結果：會購買 🛍️" })}
                    >
                      是 (Yes)
                    </button>
                    <button 
                      className={`mini-btn ${treeAnswers.member === "no" ? "active" : ""}`}
                      onClick={() => setTreeAnswers({ ...treeAnswers, member: "no", result: "預測結果：不購買 ❌" })}
                    >
                      否 (No)
                    </button>
                  </div>
                </div>
              )}

              {treeAnswers.result && (
                <div className="tree-result-card fade-in">
                  <h4>{treeAnswers.result}</h4>
                </div>
              )}
            </div>
          </div>
        );

      case "forest_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 隨機森林多重樹集成投票</h3>
            <p className="widget-desc">
              點擊按鈕，模擬隨機森林中 5 棵決策樹的獨立決策與最終的多數決投票。
            </p>

            <div className="forest-container">
              <button className="run-btn" onClick={runForestVoting} disabled={forestVoting}>
                {forestVoting ? "投票中..." : "開始投票 🗳️"}
              </button>

              <div className="trees-row">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const vote = forestVotes[idx];
                  return (
                    <div key={idx} className="tree-vote-card glass-panel">
                      <span className="tree-icon">🌲</span>
                      <span className="tree-label">樹 #{idx+1}</span>
                      <span className={`vote-badge ${vote !== undefined ? (vote === 1 ? "yes" : "no") : ""}`}>
                        {vote !== undefined ? (vote === 1 ? "會買" : "不買") : "等待"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {forestResult && (
                <div className="tree-result-card fade-in">
                  <h4>多數決共識：{forestResult}</h4>
                </div>
              )}
            </div>
          </div>
        );

      case "svm_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 SVM 最大邊界 (Margin) 與 C 參數演練</h3>
            <p className="widget-desc">
              調整懲罰參數 C 值，觀察分類邊界對錯分點的容忍度以及間隔 (Margin) 的大小變化。
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <div className="slider-group">
                  <label>懲罰參數 C: {svmC.toFixed(1)}</label>
                  <input 
                    type="range" min="0.1" max="10.0" step="0.5" value={svmC} 
                    onChange={(e) => {
                      setSvmC(parseFloat(e.target.value));
                      handlePlaygroundCompleted();
                    }}
                  />
                </div>
                <div className="slider-group">
                  <label>調整超平面角度: {svmLineAngle}°</label>
                  <input 
                    type="range" min="20" max="70" step="2" value={svmLineAngle} 
                    onChange={(e) => setSvmLineAngle(parseInt(e.target.value))}
                  />
                </div>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>邊界間隔 (Margin) 寬度:</span>
                    <span className="stat-code-val">{(2.5 / svmC).toFixed(2)}px</span>
                  </div>
                  <div className="stat-row">
                    <span>物理規律:</span>
                    <span className="stat-desc-val">C 越大，邊界越窄，對錯誤懲罰越重。</span>
                  </div>
                </div>
              </div>

              <div className="visual-panel">
                <svg width="100%" height="280" viewBox="0 0 300 200" style={{ background: "#0b0f19", borderRadius: "8px" }}>
                  {/* Points */}
                  {data.interactive_params.points.map((p: any, idx: number) => {
                    const cx = 150 + p.x * 60;
                    const cy = 100 - p.y * 60;
                    return (
                      <circle key={idx} cx={cx} cy={cy} r="5" fill={p.label === 1 ? "#3b82f6" : "#f59e0b"} />
                    );
                  })}

                  {/* Draw Hyperplane line and Margin lines based on svmLineAngle */}
                  {/* Line eq: y = mx + c. Angle determines m */}
                  {(() => {
                    const rad = (svmLineAngle * Math.PI) / 180;
                    const slopeVal = Math.tan(rad);
                    // Center is 150, 100
                    const x1 = 30;
                    const y1 = 100 - slopeVal * (x1 - 150);
                    const x2 = 270;
                    const y2 = 100 - slopeVal * (x2 - 150);

                    // Margins offset
                    const offset = (30 / svmC);
                    const margin1_y1 = y1 - offset;
                    const margin1_y2 = y2 - offset;
                    const margin2_y1 = y1 + offset;
                    const margin2_y2 = y2 + offset;

                    return (
                      <>
                        {/* Main Separating Hyperplane */}
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22c55e" strokeWidth="3" />
                        {/* Margins */}
                        <line x1={x1} y1={margin1_y1} x2={x2} y2={margin1_y2} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3" />
                        <line x1={x1} y1={margin2_y1} x2={x2} y2={margin2_y2} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3" />
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        );

      case "knn_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 KNN 點擊空間鄰近分類</h3>
            <p className="widget-desc">
              點擊右側黑色坐標圖上任意位置置入新樣本點，調整 K 值，查看 KNN 投票判定。
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <div className="slider-group">
                  <label>鄰近點個數 (K): {knnK}</label>
                  <input 
                    type="range" min="1" max="5" step="2" value={knnK} 
                    onChange={(e) => setKnnK(parseInt(e.target.value))}
                  />
                </div>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>點擊位置:</span>
                    <span className="stat-code-val">
                      {knnTestPoint ? `X: ${knnTestPoint.x}, Y: ${knnTestPoint.y}` : "尚未點擊"}
                    </span>
                  </div>
                  {knnLabelResult && (
                    <div className="stat-row">
                      <span>預測結果類別:</span>
                      <span className="stat-success-val">類別 {knnLabelResult}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="visual-panel">
                <svg 
                  width="100%" height="280" viewBox="0 0 300 200" 
                  style={{ background: "#0b0f19", borderRadius: "8px", cursor: "crosshair" }}
                  onClick={handleKnnClick}
                >
                  {/* Grid background info */}
                  <text x="10" y="20" fill="#475569" fontSize="8">點擊區域進行分類模擬</text>

                  {/* Points */}
                  {data.interactive_params.points.map((p: any, idx: number) => {
                    const cx = 50 + p.x * 50;
                    const cy = 200 - p.y * 40;
                    return (
                      <circle key={idx} cx={cx} cy={cy} r="6" fill={p.label === "A" ? "#3b82f6" : "#f59e0b"} />
                    );
                  })}

                  {/* Test point */}
                  {knnTestPoint && (
                    <>
                      <circle 
                        cx={50 + knnTestPoint.x * 50} 
                        cy={200 - knnTestPoint.y * 40} 
                        r="8" 
                        fill="#22c55e" 
                        stroke="#fff" 
                        strokeWidth="2" 
                      />
                      {/* Lines to nearest neighbors */}
                      {(() => {
                        const points = data.interactive_params.points;
                        const dists = points.map((p: any) => {
                          const dist = Math.sqrt(Math.pow(p.x - knnTestPoint.x, 2) + Math.pow(p.y - knnTestPoint.y, 2));
                          return { ...p, dist };
                        });
                        dists.sort((a: any, b: any) => a.dist - b.dist);
                        const nearest = dists.slice(0, knnK);
                        
                        return nearest.map((n: any, idx: number) => (
                          <line 
                            key={idx}
                            x1={50 + knnTestPoint.x * 50}
                            y1={200 - knnTestPoint.y * 40}
                            x2={50 + n.x * 50}
                            y2={200 - n.y * 40}
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            strokeDasharray="2"
                          />
                        ));
                      })()}
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>
        );

      case "naive_bayes_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 樸素貝葉斯垃圾郵件機率計算</h3>
            <p className="widget-desc">
              在下方輸入單字，系統將使用貝葉斯定理與條件獨立假設計算其為垃圾郵件的機率。
              （可使用辭彙：免費、中獎、發票、會議、你好）
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <div className="input-group">
                  <label>輸入郵件單字（空白分隔）:</label>
                  <input 
                    type="text" className="text-input" value={nbText} 
                    onChange={(e) => {
                      setNbText(e.target.value);
                      handlePlaygroundCompleted();
                    }} 
                  />
                </div>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>垃圾郵件機率:</span>
                    <span className="stat-code-val">{getBayesSpamProbability()}%</span>
                  </div>
                  <div className="stat-row">
                    <span>判定結果:</span>
                    <span className={getBayesSpamProbability() >= 50 ? "stat-error-val" : "stat-success-val"}>
                      {getBayesSpamProbability() >= 50 ? "垃圾郵件 (Spam)" : "正常郵件 (Ham)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="visual-panel text-calc-panel glass-panel">
                <h4>貝葉斯後驗機率公式:</h4>
                <code className="math-code">
                  P(Spam|Words) = [P(Words|Spam) * P(Spam)] / P(Words)
                </code>
                <p style={{ fontSize: "0.8rem", color: "var(--color-muted-foreground)", marginTop: "10px" }}>
                  當您輸入含有「免費」(Spam:0.8, Ham:0.1) 與「中獎」(Spam:0.9, Ham:0.05) 時，
                  Spam 分子會急遽升高，使得垃圾郵件概率大幅提升。
                </p>
              </div>
            </div>
          </div>
        );

      case "kmeans_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 K-Means 迭代聚類模擬</h3>
            <p className="widget-desc">
              點擊「下一步聚類更新」，逐步觀看中心點 (Centroids) 如何在指派與重新分配中收斂。
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <button className="run-btn" onClick={runKmeansStep}>
                  {kmeansStep === 0 && "指派樣本點到最近中心點 👇"}
                  {kmeansStep === 1 && "計算均值更新中心點位置 👇"}
                  {kmeansStep === 2 && "已收斂！點擊重置 🔄"}
                </button>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>當前步驟:</span>
                    <span className="stat-code-val">
                      {kmeansStep === 0 && "準備初始化"}
                      {kmeansStep === 1 && "步驟 1: Assign"}
                      {kmeansStep === 2 && "步驟 2: Centroid Recalculate (Converged)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="visual-panel">
                <svg width="100%" height="280" viewBox="0 0 300 200" style={{ background: "#0b0f19", borderRadius: "8px" }}>
                  {/* Centroids as larger stars or crosses */}
                  {centroids.map((c, idx) => {
                    const cx = 50 + c.x * 50;
                    const cy = 200 - c.y * 30;
                    return (
                      <g key={idx}>
                        <polygon 
                          points={`${cx},${cy-8} ${cx+2},${cy-2} ${cx+8},${cy-2} ${cx+3},${cy+2} ${cx+5},${cy+8} ${cx},${cy+4} ${cx-5},${cy+8} ${cx-3},${cy+2} ${cx-8},${cy-2} ${cx-2},${cy-2}`}
                          fill={c.color} 
                          stroke="#fff" 
                          strokeWidth="1.5" 
                        />
                      </g>
                    );
                  })}

                  {/* Points */}
                  {data.interactive_params.points.map((p: any, idx: number) => {
                    const cx = 50 + p.x * 50;
                    const cy = 200 - p.y * 30;
                    
                    // Color matches nearest centroid if step > 0
                    let dotColor = "#94a3b8"; // Default slate gray
                    if (kmeansStep > 0) {
                      let minDist = Infinity;
                      centroids.forEach(c => {
                        const dist = Math.sqrt(Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
                        if (dist < minDist) {
                          minDist = dist;
                          dotColor = c.color;
                        }
                      });
                    }

                    return (
                      <circle key={idx} cx={cx} cy={cy} r="5" fill={dotColor} />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        );

      case "pca_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 PCA 投影軸旋轉變異最大化</h3>
            <p className="widget-desc">
              調整滑桿以旋轉投影直線的夾角，觀察資料點垂直投影到直線上的展開情況。
              尋求<b>最大解釋變異量</b>（對應第一主成分 PC1 的方向）。
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <div className="slider-group">
                  <label>投影軸旋轉角度: {pcaAngle}°</label>
                  <input 
                    type="range" min="0" max="180" step="5" value={pcaAngle} 
                    onChange={(e) => {
                      setPcaAngle(parseInt(e.target.value));
                      handlePlaygroundCompleted();
                    }}
                  />
                </div>

                <div className="result-stats">
                  <div className="stat-row">
                    <span>投影後解釋變異量:</span>
                    <span className="stat-code-val">{getPcaVariance()}</span>
                  </div>
                  <div className="stat-row">
                    <span>最佳 PC1 夾角參考:</span>
                    <span className="stat-success-val">~ 25° - 30°</span>
                  </div>
                </div>
              </div>

              <div className="visual-panel">
                <svg width="100%" height="280" viewBox="0 0 300 200" style={{ background: "#0b0f19", borderRadius: "8px" }}>
                  {/* Projection line */}
                  {(() => {
                    const rad = (pcaAngle * Math.PI) / 180;
                    const cos = Math.cos(rad);
                    const sin = Math.sin(rad);
                    // Line equation through center (150, 100)
                    const x1 = 150 - cos * 120;
                    const y1 = 100 + sin * 120;
                    const x2 = 150 + cos * 120;
                    const y2 = 100 - sin * 120;

                    const points = [
                      {x: -2.0, y: -1.0}, {x: -1.5, y: -0.8}, {x: -1.0, y: -0.5},
                      {x: 0.0, y: 0.0}, {x: 1.0, y: 0.5}, {x: 1.5, y: 0.8},
                      {x: 2.0, y: 1.0}, {x: -0.5, y: -0.2}, {x: 0.5, y: 0.2}
                    ];

                    return (
                      <>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22c55e" strokeWidth="2.5" />
                        
                        {/* Original points */}
                        {points.map((p, idx) => {
                          const cx = 150 + p.x * 50;
                          const cy = 100 - p.y * 50;
                          
                          // Projected point coordinates
                          // Vector from center: dx = p.x * 50, dy = -p.y * 50
                          const dx = p.x * 50;
                          const dy = -p.y * 50;
                          // Projection scalar length: dot product
                          // line direction vector: u = [cos, -sin]
                          const u_x = cos;
                          const u_y = -sin;
                          const dot = dx * u_x + dy * u_y;
                          const proj_x = 150 + dot * u_x;
                          const proj_y = 100 + dot * u_y;

                          return (
                            <g key={idx}>
                              {/* Original */}
                              <circle cx={cx} cy={cy} r="4" fill="#3b82f6" />
                              {/* Projected */}
                              <circle cx={proj_x} cy={proj_y} r="3" fill="#ef4444" />
                              {/* Connection */}
                              <line x1={cx} y1={cy} x2={proj_x} y2={proj_y} stroke="#475569" strokeWidth="0.8" strokeDasharray="2" />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        );

      case "nn_playground":
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 簡單前饋神經網路 (Feedforward NN) 運算</h3>
            <p className="widget-desc">
              點擊「前向傳播」按鈕，體驗輸入值如何通過權重相加、偏置並由 Sigmoid 活化輸出。
            </p>

            <div className="playground-layout">
              <div className="control-panel">
                <button className="run-btn" onClick={runNnForward}>
                  執行前向傳播 (Forward Propagate) 🏃
                </button>

                <div className="result-stats">
                  {nnOutputs && (
                    <>
                      <div className="stat-row">
                        <span>隱藏層 h₁ 輸出:</span>
                        <span className="stat-code-val">{nnOutputs[0]}</span>
                      </div>
                      <div className="stat-row">
                        <span>隱藏層 h₂ 輸出:</span>
                        <span className="stat-code-val">{nnOutputs[1]}</span>
                      </div>
                      <div className="stat-row">
                        <span>最終輸出層 y 輸出:</span>
                        <span className="stat-success-val">{nnOutputs[2]}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="visual-panel">
                <svg width="100%" height="280" viewBox="0 0 300 200" style={{ background: "#0b0f19", borderRadius: "8px" }}>
                  {/* Layer labels */}
                  <text x="30" y="30" fill="#475569" fontSize="10">輸入層</text>
                  <text x="140" y="30" fill="#475569" fontSize="10">隱藏層</text>
                  <text x="240" y="30" fill="#475569" fontSize="10">輸出層</text>

                  {/* Input nodes */}
                  <circle cx="50" cy="70" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="50" y="74" textAnchor="middle" fill="#fff" fontSize="10">x₁: 1.0</text>

                  <circle cx="50" cy="130" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="50" y="134" textAnchor="middle" fill="#fff" fontSize="10">x₂: -0.5</text>

                  {/* Hidden nodes */}
                  <circle cx="150" cy="70" r="16" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                  <text x="150" y="74" textAnchor="middle" fill="#fff" fontSize="10">{nnOutputs ? `h₁:${nnOutputs[0]}` : "h₁"}</text>

                  <circle cx="150" cy="130" r="16" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                  <text x="150" y="134" textAnchor="middle" fill="#fff" fontSize="10">{nnOutputs ? `h₂:${nnOutputs[1]}` : "h₂"}</text>

                  {/* Output node */}
                  <circle cx="250" cy="100" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <text x="250" y="104" textAnchor="middle" fill="#fff" fontSize="10">{nnOutputs ? `y:${nnOutputs[2]}` : "y"}</text>

                  {/* Lines */}
                  {/* x1 -> h1 */}
                  <line x1="66" y1="70" x2="134" y2="70" stroke="#334155" strokeWidth="2" />
                  {/* x1 -> h2 */}
                  <line x1="66" y1="76" x2="136" y2="122" stroke="#334155" strokeWidth="2" />
                  {/* x2 -> h1 */}
                  <line x1="66" y1="124" x2="136" y2="78" stroke="#334155" strokeWidth="2" />
                  {/* x2 -> h2 */}
                  <line x1="66" y1="130" x2="134" y2="130" stroke="#334155" strokeWidth="2" />

                  {/* h1 -> y */}
                  <line x1="166" y1="76" x2="236" y2="94" stroke="#334155" strokeWidth="2" />
                  {/* h2 -> y */}
                  <line x1="166" y1="124" x2="236" y2="106" stroke="#334155" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="playground-box">
            <h3 className="widget-title">🧪 互動式學習演練正在建構中</h3>
            <p className="widget-desc">本演算法的專屬互動元件正在優化中，點擊下方解鎖完成。</p>
            <button className="run-btn" onClick={handlePlaygroundCompleted}>解鎖完成進度 🧪</button>
          </div>
        );
    }
  };

  return (
    <div className="layout-container">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <Link href="/" className="back-link">← 返回儀表板</Link>
          <div className="header-main">
            <h1 className="alg-title">{data.name}</h1>
            <span className="alg-type-tag">{data.type}</span>
          </div>
          <p className="header-desc">🎯 <b>主要用途：</b>{data.usage} | 💡 <b>核心想法：</b>{data.idea}</p>
        </header>

        {/* Tab Selection */}
        <div className="tabs-row">
          <button 
            className={`tab-btn ${activeTab === "study" ? "active" : ""}`}
            onClick={() => setActiveTab("study")}
          >
            📖 課程研讀指引
          </button>
          <button 
            className={`tab-btn ${activeTab === "playground" ? "active" : ""}`}
            onClick={() => setActiveTab("playground")}
          >
            🧪 互動演練遊樂場
          </button>
          <button 
            className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            📝 觀念挑戰測驗
          </button>
        </div>

        {/* Tab Contents */}
        <div className="tab-viewport">
          {activeTab === "study" && (
            <div className="tab-pane study-pane fade-in">
              <div className="study-section">
                <h3>一、核心概念</h3>
                <p className="study-text">{data.concept}</p>
              </div>

              <div className="study-section">
                <h3>二、運作流程</h3>
                <ol className="workflow-list">
                  {data.workflow.map((step, idx) => (
                    <li key={idx}>
                      <span className="workflow-step-num">{idx + 1}</span>
                      <p className="workflow-step-text">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="study-section">
                <h3>三、實務例子</h3>
                <div className="example-box glass-panel">
                  <p>{data.examples}</p>
                </div>
              </div>

              <div className="study-section">
                <h3>四、優點、限制與常見錯誤</h3>
                <div className="pros-cons-grid">
                  <div className="pros-card glass-panel">
                    <h4 className="card-title pros-title">優點 (Advantages)</h4>
                    <ul>
                      {data.pros_cons.pros.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>
                  <div className="cons-card glass-panel">
                    <h4 className="card-title cons-title">限制與缺點 (Limitations)</h4>
                    <ul>
                      {data.pros_cons.cons.map((c, idx) => <li key={idx}>{c}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mistake-box glass-panel">
                  <h4 className="card-title mistakes-title">⚠️ 常見實務錯誤與陷阱</h4>
                  <p>{data.pros_cons.mistakes}</p>
                </div>
              </div>

              <div className="study-section">
                <h3>五、學習與實作建議</h3>
                <div className="advice-box glass-panel">
                  <p>{data.study_advice}</p>
                </div>
              </div>

              <div className="study-footer-actions">
                <button 
                  className={`completed-btn ${data.progress.study_completed ? "completed" : ""}`}
                  onClick={handleStudyCompleted}
                >
                  {data.progress.study_completed ? "✓ 研讀完成！" : "標記研讀完成 📖"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "playground" && (
            <div className="tab-pane playground-pane fade-in">
              {renderPlayground()}
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="tab-pane quiz-pane fade-in">
              <h3 className="quiz-pane-title">📝 觀念自我挑戰測驗</h3>
              <p className="quiz-pane-desc">本測驗共 3 題，回答正確率達 60% (答對 2 題以上) 即算通過挑戰！</p>

              <div className="quiz-list">
                {quizzes.map((q, idx) => {
                  const correctRes = quizResult?.results.find(r => r.id === q.id);
                  return (
                    <div key={q.id} className="quiz-card glass-panel">
                      <h4 className="quiz-question">{idx + 1}. {q.question}</h4>
                      <div className="quiz-options-list">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          const showCorrectness = quizResult !== null;
                          const isCorrectOpt = q.id !== undefined && correctRes?.correct_answer === optIdx;
                          const isWrongUserOpt = showCorrectness && isSelected && !correctRes?.is_correct;

                          return (
                            <label 
                              key={optIdx} 
                              className={`quiz-option-label ${isSelected ? "selected" : ""} ${isCorrectOpt ? "correct-opt" : ""} ${isWrongUserOpt ? "wrong-opt" : ""}`}
                            >
                              <input 
                                type="radio" 
                                name={`quiz-${q.id}`} 
                                checked={isSelected}
                                disabled={quizResult !== null}
                                onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>

                      {correctRes && (
                        <div className={`quiz-explanation-box ${correctRes.is_correct ? "correct" : "wrong"}`}>
                          <div className="explanation-status">
                            {correctRes.is_correct ? "✓ 回答正確" : `✗ 回答錯誤 (正確答案：${q.options[correctRes.correct_answer]})`}
                          </div>
                          <p className="explanation-text">{correctRes.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizResult ? (
                <button 
                  className="submit-quiz-btn"
                  onClick={submitQuiz}
                  disabled={quizLoading}
                >
                  {quizLoading ? "批改中..." : "送出測驗答案 🚀"}
                </button>
              ) : (
                <div className="quiz-score-banner glass-panel">
                  <h4>測驗分數：<span className="score-val">{quizResult.score}分</span></h4>
                  <p className={quizResult.passed ? "passed-text" : "failed-text"}>
                    {quizResult.passed ? "🎉 恭喜通過！已解鎖本演算法的測驗進度。" : "😢 答對題數未達標準，再試一次吧！"}
                  </p>
                  <button className="retry-quiz-btn" onClick={() => fetchQuiz()}>重新挑戰 🔄</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes Section - Sticky bottom/side panel */}
        <section className="notes-section glass-panel">
          <div className="notes-header">
            <h3>📝 我的個人研讀筆記 (SQLite 保存)</h3>
            <span className="notes-status-text">{notesStatus}</span>
          </div>
          <textarea 
            className="notes-textarea" 
            placeholder="在這裡記錄您的研讀心得、思考重點、或是與其他演算法的比較..."
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
          />
          <button 
            className="save-notes-btn" 
            onClick={saveNotes}
            disabled={notesSaving}
          >
            {notesSaving ? "儲存中..." : "儲存筆記 💾"}
          </button>
        </section>
      </main>

      <style jsx>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-background);
        }

        .main-content {
          margin-left: 300px;
          flex: 1;
          padding: var(--space-xl);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .back-link {
          font-size: 0.85rem;
          color: var(--color-muted-foreground);
          margin-bottom: var(--space-sm);
          display: inline-block;
        }

        .back-link:hover {
          color: var(--color-accent);
        }

        .header-main {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-xs);
        }

        .alg-title {
          font-size: 2rem;
          color: var(--color-foreground);
        }

        .alg-type-tag {
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-sm);
          padding: 3px 8px;
          font-size: 0.75rem;
          font-family: var(--font-heading);
          font-weight: 600;
        }

        .header-desc {
          color: var(--color-muted-foreground);
          font-size: 0.95rem;
        }

        .tabs-row {
          display: flex;
          border-bottom: 2px solid var(--color-border);
          gap: var(--space-sm);
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--color-muted-foreground);
          padding: var(--space-sm) var(--space-lg);
          font-size: 1rem;
          font-weight: 600;
          transition: all 200ms ease;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
        }

        .tab-btn:hover {
          color: var(--color-foreground);
        }

        .tab-btn.active {
          color: var(--color-accent);
          border-bottom-color: var(--color-accent);
        }

        .tab-viewport {
          min-height: 400px;
        }

        .study-pane {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .study-section h3 {
          font-size: 1.25rem;
          margin-bottom: var(--space-md);
          border-left: 4px solid var(--color-accent);
          padding-left: var(--space-sm);
        }

        .study-text {
          color: #e2e8f0;
          white-space: pre-wrap;
          font-size: 0.98rem;
        }

        .workflow-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .workflow-list li {
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
        }

        .workflow-step-num {
          background: var(--color-secondary);
          color: var(--color-foreground);
          font-family: var(--font-heading);
          font-weight: bold;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.85rem;
          border: 1px solid var(--color-border);
        }

        .workflow-step-text {
          padding-top: 2px;
          color: #cbd5e1;
        }

        .example-box {
          padding: var(--space-lg);
          background-color: rgba(30, 41, 59, 0.2);
          border-left: 4px solid #38bdf8;
          color: #e2e8f0;
        }

        .pros-cons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .pros-card, .cons-card, .mistake-box, .advice-box {
          padding: var(--space-lg);
        }

        .pros-title {
          color: #22c55e;
        }

        .cons-title {
          color: #ef4444;
        }

        .mistakes-title {
          color: #f59e0b;
        }

        .pros-card ul, .cons-card ul {
          list-style-type: square;
          padding-left: var(--space-lg);
          color: #cbd5e1;
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .mistake-box {
          border-left: 4px solid #f59e0b;
          color: #e2e8f0;
        }

        .advice-box {
          border-left: 4px solid var(--color-accent);
          color: #e2e8f0;
        }

        .completed-btn {
          background: transparent;
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          font-weight: 600;
          padding: var(--space-sm) var(--space-xl);
          border-radius: var(--radius-sm);
          transition: all 250ms ease;
        }

        .completed-btn:hover {
          background: rgba(34, 197, 94, 0.05);
          transform: translateY(-1px);
        }

        .completed-btn.completed {
          background: var(--color-accent);
          color: white;
        }

        /* Playground base styles */
        .playground-box {
          padding: var(--space-xl);
          background-color: rgba(11, 15, 25, 0.6);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .widget-title {
          font-size: 1.3rem;
          margin-bottom: var(--space-xs);
          color: var(--color-accent);
        }

        .widget-desc {
          font-size: 0.9rem;
          color: var(--color-muted-foreground);
          margin-bottom: var(--space-xl);
        }

        .playground-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: var(--space-xl);
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .slider-group label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-foreground);
        }

        .slider-group input[type="range"] {
          accent-color: var(--color-accent);
          background: var(--color-secondary);
          height: 6px;
          border-radius: var(--radius-full);
          cursor: pointer;
        }

        .result-stats {
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .stat-code-val {
          font-family: var(--font-heading);
          color: #38bdf8;
          font-weight: bold;
        }

        .stat-success-val {
          font-family: var(--font-heading);
          color: #22c55e;
          font-weight: bold;
        }

        .stat-error-val {
          font-family: var(--font-heading);
          color: #ef4444;
          font-weight: bold;
        }

        .stat-desc-val {
          color: var(--color-muted-foreground);
          font-size: 0.8rem;
        }

        .visual-panel {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Decision Tree Playground */
        .tree-flow-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          align-items: center;
          padding: var(--space-md);
        }

        .tree-question-card {
          padding: var(--space-md);
          width: 100%;
          max-width: 450px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .btn-group {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
        }

        .mini-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: 6px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          transition: all 200ms ease;
        }

        .mini-btn:hover, .mini-btn.active {
          border-color: var(--color-accent);
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-accent);
        }

        .tree-result-card {
          background: rgba(34, 197, 94, 0.08);
          border: 1px dashed var(--color-accent);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          color: var(--color-accent);
          text-align: center;
          width: 100%;
          max-width: 450px;
        }

        /* Random Forest Playground */
        .forest-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
        }

        .run-btn {
          background: var(--color-accent);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: var(--radius-sm);
          font-weight: bold;
          font-size: 1rem;
          transition: all 250ms ease;
        }

        .run-btn:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
        }

        .run-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .trees-row {
          display: flex;
          gap: var(--space-md);
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tree-vote-card {
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 100px;
        }

        .tree-icon {
          font-size: 1.8rem;
        }

        .tree-label {
          font-size: 0.75rem;
          color: var(--color-muted-foreground);
        }

        .vote-badge {
          font-size: 0.8rem;
          font-weight: bold;
          color: var(--color-muted-foreground);
        }

        .vote-badge.yes {
          color: #3b82f6;
        }

        .vote-badge.no {
          color: #f59e0b;
        }

        /* Naive Bayes input */
        .text-input {
          background: #0b0f19;
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 0.95rem;
          width: 100%;
        }

        .text-input:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .text-calc-panel {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          align-self: stretch;
          justify-content: center;
        }

        .math-code {
          background: #000;
          color: #38bdf8;
          padding: var(--space-sm);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          word-break: break-all;
        }

        /* Quiz styles */
        .quiz-pane-title {
          font-size: 1.25rem;
          margin-bottom: var(--space-xs);
        }

        .quiz-pane-desc {
          color: var(--color-muted-foreground);
          font-size: 0.88rem;
          margin-bottom: var(--space-xl);
        }

        .quiz-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .quiz-card {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .quiz-question {
          font-size: 1.05rem;
          color: var(--color-foreground);
        }

        .quiz-options-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .quiz-option-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 150ms ease;
          font-size: 0.92rem;
        }

        .quiz-option-label:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .quiz-option-label.selected {
          border-color: var(--color-accent);
          background: rgba(34, 197, 94, 0.04);
        }

        .quiz-option-label.correct-opt {
          border-color: #22c55e !important;
          background: rgba(34, 197, 94, 0.1) !important;
          color: #22c55e;
          font-weight: bold;
        }

        .quiz-option-label.wrong-opt {
          border-color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444;
          text-decoration: line-through;
        }

        .quiz-explanation-box {
          margin-top: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
        }

        .quiz-explanation-box.correct {
          background: rgba(34, 197, 94, 0.05);
          border-left: 4px solid #22c55e;
        }

        .quiz-explanation-box.wrong {
          background: rgba(239, 68, 68, 0.05);
          border-left: 4px solid #ef4444;
        }

        .explanation-status {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .explanation-status.correct {
          color: #22c55e;
        }

        .explanation-status.wrong {
          color: #ef4444;
        }

        .explanation-text {
          color: #cbd5e1;
        }

        .submit-quiz-btn {
          background: var(--color-accent);
          color: white;
          border: none;
          padding: var(--space-sm) var(--space-2xl);
          border-radius: var(--radius-sm);
          font-weight: bold;
          font-size: 1rem;
          transition: all 250ms ease;
        }

        .submit-quiz-btn:hover {
          background: var(--color-accent-hover);
        }

        .quiz-score-banner {
          padding: var(--space-lg);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .score-val {
          color: var(--color-accent);
          font-size: 1.8rem;
          font-family: var(--font-heading);
        }

        .passed-text {
          color: #22c55e;
          font-weight: bold;
        }

        .failed-text {
          color: #ef4444;
          font-weight: bold;
        }

        .retry-quiz-btn {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: 6px 16px;
          border-radius: var(--radius-sm);
          margin-top: var(--space-sm);
          transition: all 200ms ease;
        }

        .retry-quiz-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Notes Section */
        .notes-section {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-top: var(--space-xl);
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notes-status-text {
          font-size: 0.85rem;
          color: var(--color-accent);
          font-family: var(--font-heading);
          font-weight: bold;
        }

        .notes-textarea {
          width: 100%;
          height: 120px;
          background: #0b0f19;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-foreground);
          padding: var(--space-md);
          font-family: var(--font-body);
          font-size: 0.95rem;
          resize: vertical;
        }

        .notes-textarea:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .save-notes-btn {
          align-self: flex-end;
          background: var(--color-primary);
          color: white;
          border: 1px solid var(--color-border);
          padding: 8px 20px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          transition: all 200ms ease;
        }

        .save-notes-btn:hover:not(:disabled) {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background: rgba(34, 197, 94, 0.05);
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-background);
          color: var(--color-muted-foreground);
          font-size: 1.2rem;
        }

        /* Utilities */
        .fade-in {
          animation: fadeIn 400ms ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Simple generic Dict interface
type Dict<K extends string | number, V> = {
  [key in K]?: V;
};
