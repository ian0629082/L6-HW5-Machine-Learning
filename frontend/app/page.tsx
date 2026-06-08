"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

interface AlgorithmSummary {
  id: string;
  name: string;
  type: string;
  usage: string;
  idea: string;
  study_completed: boolean;
  quiz_completed: boolean;
  playground_completed: boolean;
}

export default function Dashboard() {
  const [algorithms, setAlgorithms] = useState<AlgorithmSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [labeled, setLabeled] = useState<boolean | null>(null);
  const [targetType, setTargetType] = useState<string | null>(null); // "continuous" | "categorical"
  const [needExplain, setNeedExplain] = useState<boolean | null>(null);
  const [isSparseText, setIsSparseText] = useState<boolean | null>(null);
  const [unsupervisedGoal, setUnsupervisedGoal] = useState<string | null>(null); // "clustering" | "dimension_reduction"
  const [recommendation, setRecommendation] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchAlgorithms();
  }, []);

  const fetchAlgorithms = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/algorithms");
      if (res.ok) {
        const data = await res.json();
        setAlgorithms(data);
      }
    } catch (err) {
      console.error("Failed to fetch algorithms summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    let study = 0;
    let playground = 0;
    let quiz = 0;
    algorithms.forEach((a) => {
      if (a.study_completed) study++;
      if (a.playground_completed) playground++;
      if (a.quiz_completed) quiz++;
    });
    return { study, playground, quiz, total: algorithms.length };
  };

  const resetWizard = () => {
    setWizardStep(1);
    setLabeled(null);
    setTargetType(null);
    setNeedExplain(null);
    setIsSparseText(null);
    setUnsupervisedGoal(null);
    setRecommendation(null);
  };

  const handleLabeledSelect = (val: boolean) => {
    setLabeled(val);
    if (val) {
      setWizardStep(2); // Go to prediction target
    } else {
      setWizardStep(5); // Go to unsupervised goal
    }
  };

  const handleTargetSelect = (val: string) => {
    setTargetType(val);
    if (val === "continuous") {
      setRecommendation({ id: "linear-regression", name: "線性迴歸 (Linear Regression)" });
      setWizardStep(6); // Final result
    } else {
      setWizardStep(3); // Ask for explainability
    }
  };

  const handleExplainSelect = (val: boolean) => {
    setNeedExplain(val);
    if (val) {
      setRecommendation({ id: "decision-tree", name: "決策樹 (Decision Tree)" });
      setWizardStep(6);
    } else {
      setWizardStep(4); // Ask for text data
    }
  };

  const handleSparseTextSelect = (val: boolean) => {
    setIsSparseText(val);
    if (val) {
      setRecommendation({ id: "naive-bayes", name: "樸素貝葉斯 (Naive Bayes)" });
    } else {
      setRecommendation({ id: "random-forest", name: "隨機森林 (Random Forest) / 支援向量機 (SVM) / K近鄰 (KNN)" });
    }
    setWizardStep(6);
  };

  const handleUnsupervisedSelect = (val: string) => {
    setUnsupervisedGoal(val);
    if (val === "clustering") {
      setRecommendation({ id: "k-means-clustering", name: "K-Means 分群 (K-Means Clustering)" });
    } else {
      setRecommendation({ id: "principal-component-analysis", name: "主成分分析 (Principal Component Analysis, PCA)" });
    }
    setWizardStep(6);
  };

  const stats = getStats();

  return (
    <div className="layout-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="page-header">
          <div className="header-info">
            <h1 className="main-title">機器學習演算法動態學習中心</h1>
            <p className="subtitle">請根據左側十大學習主題進入學習，或透過下方的演算法指南進行探索。</p>
          </div>
        </header>

        <section className="stats-section">
          <div className="glass-panel stat-card">
            <span className="stat-icon">📖</span>
            <div className="stat-info">
              <span className="stat-label">導引閱讀進度</span>
              <span className="stat-value">{stats.study} / {stats.total}</span>
            </div>
            <div className="stat-progress-bar">
              <div className="stat-progress" style={{ width: `${(stats.study / stats.total) * 100}%` }}></div>
            </div>
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-icon">🧪</span>
            <div className="stat-info">
              <span className="stat-label">互動遊樂場完成</span>
              <span className="stat-value">{stats.playground} / {stats.total}</span>
            </div>
            <div className="stat-progress-bar">
              <div className="stat-progress" style={{ width: `${(stats.playground / stats.total) * 100}%` }}></div>
            </div>
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-icon">📝</span>
            <div className="stat-info">
              <span className="stat-label">觀念挑戰通過</span>
              <span className="stat-value">{stats.quiz} / {stats.total}</span>
            </div>
            <div className="stat-progress-bar">
              <div className="stat-progress" style={{ width: `${(stats.quiz / stats.total) * 100}%` }}></div>
            </div>
          </div>
        </section>

        {/* Section 1: Interactive Algorithm Selection Wizard */}
        <section className="dashboard-section">
          <h2 className="section-title">🔮 演算法決策精靈 (Algorithm Selection Wizard)</h2>
          <div className="glass-panel wizard-container">
            <div className="wizard-inner">
              {wizardStep === 1 && (
                <div className="wizard-step">
                  <h3 className="wizard-question">第一步：您的資料是否有標籤 (Labels / Ground Truth)？</h3>
                  <p className="wizard-desc">也就是說，您的資料是否已經包含您想預測的答案標籤？</p>
                  <div className="wizard-options">
                    <button className="wizard-btn" onClick={() => handleLabeledSelect(true)}>
                      <span className="option-title">有標籤 (Labeled Data)</span>
                      <span className="option-subtitle">進行監督式學習 (分類/回歸)</span>
                    </button>
                    <button className="wizard-btn" onClick={() => handleLabeledSelect(false)}>
                      <span className="option-title">無標籤 (Unlabeled Data)</span>
                      <span className="option-subtitle">進行非監督式學習 (分群/降維)</span>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-step">
                  <h3 className="wizard-question">第二步：您想要預測的目標數值是什麼型態？</h3>
                  <div className="wizard-options">
                    <button className="wizard-btn" onClick={() => handleTargetSelect("continuous")}>
                      <span className="option-title">連續數值 (Continuous Value)</span>
                      <span className="option-subtitle">預測房價、營收、溫度等（回歸任務）</span>
                    </button>
                    <button className="wizard-btn" onClick={() => handleTargetSelect("categorical")}>
                      <span className="option-title">類別標籤 (Categorical Label)</span>
                      <span className="option-subtitle">預測流失/不流失、垃圾/正常郵件（分類任務）</span>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="wizard-step">
                  <h3 className="wizard-question">第三步：您是否需要能輕易向非技術人員解釋的規則？</h3>
                  <div className="wizard-options">
                    <button className="wizard-btn" onClick={() => handleExplainSelect(true)}>
                      <span className="option-title">高度需要 (Explainable Rules)</span>
                      <span className="option-subtitle">希望規則像流程圖一樣直觀且可讀</span>
                    </button>
                    <button className="wizard-btn" onClick={() => handleExplainSelect(false)}>
                      <span className="option-title">不需要 (Performance Priority)</span>
                      <span className="option-subtitle">以準確率與穩定度優先，黑盒子模型也可以接受</span>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="wizard-step">
                  <h3 className="wizard-question">第四步：您的特徵主要是高維度且稀疏的文字資料嗎？</h3>
                  <div className="wizard-options">
                    <button className="wizard-btn" onClick={() => handleSparseTextSelect(true)}>
                      <span className="option-title">是的 (Sparse Text Data)</span>
                      <span className="option-subtitle">例如電子郵件詞頻、社群文章分類任務</span>
                    </button>
                    <button className="wizard-btn" onClick={() => handleSparseTextSelect(false)}>
                      <span className="option-title">不是 (Tabular/Dense Data)</span>
                      <span className="option-subtitle">一般結構化表格、數值特徵等</span>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="wizard-step">
                  <h3 className="wizard-question">您的非監督式任務，主要目的是什麼？</h3>
                  <div className="wizard-options">
                    <button className="wizard-btn" onClick={() => handleUnsupervisedSelect("clustering")}>
                      <span className="option-title">資料分群 (Clustering)</span>
                      <span className="option-subtitle">將客戶或樣本點依相似度分為幾群</span>
                    </button>
                    <button className="wizard-btn" onClick={() => handleUnsupervisedSelect("dimension_reduction")}>
                      <span className="option-title">特徵降維/壓縮 (Dimensionality Reduction)</span>
                      <span className="option-subtitle">減少特徵欄位、去噪或進行 2D 視覺化</span>
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 6 && recommendation && (
                <div className="wizard-step recommendation-step">
                  <div className="recommendation-badge">推薦結果</div>
                  <h3 className="recommendation-title">{recommendation.name}</h3>
                  <p className="recommendation-text">
                    根據您的選擇，我們推薦您首選該演算法進行建模。您可以直接進入該演算法的專頁開始學習！
                  </p>
                  <div className="wizard-footer-buttons">
                    <button className="reset-btn" onClick={resetWizard}>重新測試 🔄</button>
                    {recommendation.id !== "random-forest" ? (
                      <Link href={`/algorithm/${recommendation.id}`} className="go-btn">
                        開始學習 🚀
                      </Link>
                    ) : (
                      <div className="multi-recommendations">
                        <Link href="/algorithm/random-forest" className="go-btn mini">隨機森林 🌲</Link>
                        <Link href="/algorithm/support-vector-machine" className="go-btn mini">SVM 📈</Link>
                        <Link href="/algorithm/k-nearest-neighbors" className="go-btn mini">KNN 📍</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: SVG Learning Roadmap */}
        <section className="dashboard-section">
          <h2 className="section-title">🗺️ 演算法學習地圖 (Learning Route Map)</h2>
          <p className="section-subtitle">點擊下方流程圖中的節點，可直接跳轉至該主題進行研讀！</p>
          <div className="glass-panel roadmap-container">
            <svg width="100%" height="450" viewBox="0 0 1000 450" className="roadmap-svg">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                </marker>
                <marker id="arrow-completed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                </marker>
              </defs>

              {/* Connections/Lines */}
              {/* Regression -> Classification */}
              <line x1="180" y1="120" x2="300" y2="120" stroke={algorithms.find(a => a.id === "linear-regression")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "linear-regression")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} />
              
              {/* Classification -> Tree Models */}
              <path d="M 460 120 L 520 70" stroke={algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} fill="none" />
              
              {/* Tree -> Forest */}
              <line x1="680" y1="70" x2="780" y2="70" stroke={algorithms.find(a => a.id === "decision-tree")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "decision-tree")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} />
              
              {/* Classification -> Advanced Classifiers */}
              <path d="M 460 120 L 520 170" stroke={algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} fill="none" />
              
              {/* SVM -> KNN */}
              <line x1="680" y1="170" x2="780" y2="170" stroke={algorithms.find(a => a.id === "support-vector-machine")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "support-vector-machine")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} />

              {/* Classification -> Naive Bayes */}
              <path d="M 460 120 L 520 270" stroke={algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} fill="none" />

              {/* Unsupervised: K-Means -> PCA */}
              <line x1="180" y1="360" x2="300" y2="360" stroke={algorithms.find(a => a.id === "k-means-clustering")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "k-means-clustering")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} />

              {/* PCA -> Deep Learning */}
              <path d="M 460 360 L 630 360" stroke={algorithms.find(a => a.id === "principal-component-analysis")?.study_completed ? "#22c55e" : "#334155"} strokeWidth="3" markerEnd={algorithms.find(a => a.id === "principal-component-analysis")?.study_completed ? "url(#arrow-completed)" : "url(#arrow)"} fill="none" />

              {/* Forest & KNN -> Deep Learning */}
              <path d="M 900 120 L 900 320 C 900 360, 850 360, 810 360" stroke="#334155" strokeWidth="3" markerEnd="url(#arrow)" fill="none" />

              {/* SVG Nodes */}
              {/* 1. Linear Regression */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/linear-regression"}>
                <rect x="20" y="80" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "linear-regression")?.study_completed ? "completed" : ""}`} />
                <text x="100" y="120" textAnchor="middle" className="node-text">線性迴歸</text>
                <text x="100" y="140" textAnchor="middle" className="node-sub">1. 監督式 - 回歸</text>
              </g>

              {/* 2. Logistic Regression */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/logistic-regression"}>
                <rect x="300" y="80" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "logistic-regression")?.study_completed ? "completed" : ""}`} />
                <text x="380" y="120" textAnchor="middle" className="node-text">邏輯斯迴歸</text>
                <text x="380" y="140" textAnchor="middle" className="node-sub">2. 監督式 - 分類</text>
              </g>

              {/* 3. Decision Tree */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/decision-tree"}>
                <rect x="520" y="30" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "decision-tree")?.study_completed ? "completed" : ""}`} />
                <text x="600" y="70" textAnchor="middle" className="node-text">決策樹</text>
                <text x="600" y="90" textAnchor="middle" className="node-sub">3. 監督式 - 樹模型</text>
              </g>

              {/* 4. Random Forest */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/random-forest"}>
                <rect x="780" y="30" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "random-forest")?.study_completed ? "completed" : ""}`} />
                <text x="860" y="70" textAnchor="middle" className="node-text">隨機森林</text>
                <text x="860" y="90" textAnchor="middle" className="node-sub">4. 監督式 - 集成</text>
              </g>

              {/* 5. Support Vector Machine */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/support-vector-machine"}>
                <rect x="520" y="130" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "support-vector-machine")?.study_completed ? "completed" : ""}`} />
                <text x="600" y="170" textAnchor="middle" className="node-text">支援向量機</text>
                <text x="600" y="190" textAnchor="middle" className="node-sub">5. 監督式 - 分類</text>
              </g>

              {/* 6. KNN */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/k-nearest-neighbors"}>
                <rect x="780" y="130" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "k-nearest-neighbors")?.study_completed ? "completed" : ""}`} />
                <text x="860" y="170" textAnchor="middle" className="node-text">K 近鄰演算法</text>
                <text x="860" y="190" textAnchor="middle" className="node-sub">6. 監督式 - 鄰近點</text>
              </g>

              {/* 7. Naive Bayes */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/naive-bayes"}>
                <rect x="520" y="230" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "naive-bayes")?.study_completed ? "completed" : ""}`} />
                <text x="600" y="270" textAnchor="middle" className="node-text">樸素貝葉斯</text>
                <text x="600" y="290" textAnchor="middle" className="node-sub">7. 監督式 - 文字分類</text>
              </g>

              {/* 8. K-Means */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/k-means-clustering"}>
                <rect x="20" y="320" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "k-means-clustering")?.study_completed ? "completed" : ""}`} />
                <text x="100" y="360" textAnchor="middle" className="node-text">K-Means 分群</text>
                <text x="100" y="380" textAnchor="middle" className="node-sub">8. 非監督式 - 分群</text>
              </g>

              {/* 9. PCA */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/principal-component-analysis"}>
                <rect x="300" y="320" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "principal-component-analysis")?.study_completed ? "completed" : ""}`} />
                <text x="380" y="360" textAnchor="middle" className="node-text">主成分分析</text>
                <text x="380" y="380" textAnchor="middle" className="node-sub">9. 非監督式 - 降維</text>
              </g>

              {/* 10. Deep Learning */}
              <g className="svg-node" onClick={() => window.location.href="/algorithm/deep-learning"}>
                <rect x="630" y="320" width="160" height="80" rx="10" className={`node-rect ${algorithms.find(a => a.id === "deep-learning")?.study_completed ? "completed" : ""}`} />
                <text x="710" y="360" textAnchor="middle" className="node-text">深度學習</text>
                <text x="710" y="380" textAnchor="middle" className="node-sub">10. 神經網路/前沿</text>
              </g>
            </svg>
          </div>
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
        }

        .page-header {
          margin-bottom: var(--space-xl);
        }

        .main-title {
          font-size: 2.2rem;
          margin-bottom: var(--space-sm);
          background: linear-gradient(135deg, #38bdf8 0%, #22c55e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--color-muted-foreground);
          font-size: 1.05rem;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .stat-card {
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
          position: relative;
          overflow: hidden;
        }

        .stat-icon {
          font-size: 2.2rem;
          background: rgba(255, 255, 255, 0.05);
          padding: var(--space-sm);
          border-radius: var(--radius-md);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--color-muted-foreground);
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--color-foreground);
        }

        .stat-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-progress {
          height: 100%;
          background: var(--color-accent);
          transition: width 800ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dashboard-section {
          margin-bottom: var(--space-3xl);
        }

        .section-title {
          font-size: 1.4rem;
          margin-bottom: var(--space-xs);
          color: var(--color-foreground);
        }

        .section-subtitle {
          color: var(--color-muted-foreground);
          font-size: 0.9rem;
          margin-bottom: var(--space-md);
        }

        .wizard-container {
          padding: var(--space-xl);
        }

        .wizard-inner {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .wizard-question {
          font-size: 1.25rem;
          margin-bottom: var(--space-sm);
          color: var(--color-foreground);
        }

        .wizard-desc {
          color: var(--color-muted-foreground);
          font-size: 0.95rem;
          margin-bottom: var(--space-xl);
        }

        .wizard-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .wizard-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          text-align: left;
          color: var(--color-foreground);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          transition: all 200ms ease;
        }

        .wizard-btn:hover {
          border-color: var(--color-accent);
          background: rgba(34, 197, 94, 0.05);
          transform: translateY(-2px);
        }

        .option-title {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .option-subtitle {
          font-size: 0.85rem;
          color: var(--color-muted-foreground);
        }

        .recommendation-step {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }

        .recommendation-badge {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-accent);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: var(--radius-sm);
          padding: 4px var(--space-sm);
          font-size: 0.75rem;
          font-family: var(--font-heading);
          font-weight: bold;
          text-transform: uppercase;
        }

        .recommendation-title {
          font-size: 1.8rem;
          color: var(--color-foreground);
        }

        .recommendation-text {
          color: var(--color-muted-foreground);
          max-width: 500px;
        }

        .wizard-footer-buttons {
          display: flex;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .reset-btn {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: var(--space-sm) var(--space-lg);
          border-radius: var(--radius-sm);
          transition: all 200ms ease;
        }

        .reset-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .go-btn {
          background: var(--color-accent);
          color: white;
          padding: var(--space-sm) var(--space-lg);
          border-radius: var(--radius-sm);
          font-weight: 600;
          transition: all 200ms ease;
          display: inline-block;
        }

        .go-btn:hover {
          background: var(--color-accent-hover);
          color: white;
          transform: translateY(-1px);
        }

        .multi-recommendations {
          display: flex;
          gap: var(--space-sm);
        }

        .go-btn.mini {
          padding: var(--space-sm) var(--space-md);
          font-size: 0.85rem;
        }

        .roadmap-container {
          padding: var(--space-xl);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .roadmap-svg {
          background: #0b0f19;
          border-radius: var(--radius-md);
        }

        .svg-node {
          cursor: pointer;
        }

        .node-rect {
          fill: #1e293b;
          stroke: #334155;
          stroke-width: 2;
          transition: all 250ms ease;
        }

        .node-rect:hover {
          fill: #273549;
          stroke: var(--color-accent);
          filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.4));
        }

        .node-rect.completed {
          stroke: var(--color-accent);
          stroke-width: 3;
        }

        .node-text {
          fill: var(--color-foreground);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          pointer-events: none;
        }

        .node-sub {
          fill: var(--color-muted-foreground);
          font-family: var(--font-heading);
          font-size: 10px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
