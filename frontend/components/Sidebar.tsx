"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Sidebar() {
  const pathname = usePathname();
  const [algorithms, setAlgorithms] = useState<AlgorithmSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlgorithms();
    
    // Add event listener to refresh when progress updates
    const handleProgressUpdate = () => {
      fetchAlgorithms();
    };
    window.addEventListener("progressUpdated", handleProgressUpdate);
    return () => {
      window.removeEventListener("progressUpdated", handleProgressUpdate);
    };
  }, []);

  const fetchAlgorithms = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/algorithms");
      if (res.ok) {
        const data = await res.json();
        setAlgorithms(data);
      }
    } catch (err) {
      console.error("Failed to fetch algorithms in sidebar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/">
          <div className="logo-container">
            <span className="logo-icon">⚡</span>
            <div>
              <h1 className="logo-title">ML Mastery</h1>
              <p className="logo-subtitle">十大演算法學習平台</p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">主要面板</div>
        <Link 
          href="/" 
          className={`nav-link ${pathname === "/" ? "active" : ""}`}
        >
          <span className="nav-icon">📊</span> 首頁儀表板
        </Link>

        <div className="nav-section-title">十大學習主題</div>
        {loading ? (
          <div className="sidebar-loading">讀取中...</div>
        ) : (
          <ul className="algorithm-list">
            {algorithms.map((alg) => {
              const isActive = pathname === `/algorithm/${alg.id}`;
              return (
                <li key={alg.id}>
                  <Link 
                    href={`/algorithm/${alg.id}`}
                    className={`nav-link alg-link ${isActive ? "active" : ""}`}
                  >
                    <div className="alg-info">
                      <span className="alg-name">{alg.name.split(" ")[0]}</span>
                      <span className="alg-type">{alg.type.split(" ")[2] || alg.type.split(" ")[0]}</span>
                    </div>
                    
                    <div className="progress-badges">
                      <span 
                        title="已研讀導引"
                        className={`badge ${alg.study_completed ? "completed" : ""}`}
                      >
                        📖
                      </span>
                      <span 
                        title="已完成互動演練" 
                        className={`badge ${alg.playground_completed ? "completed" : ""}`}
                      >
                        🧪
                      </span>
                      <span 
                        title="已通過測驗"
                        className={`badge ${alg.quiz_completed ? "completed" : ""}`}
                      >
                        📝
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="theme-badge">UI/UX PRO MAX OLED</div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 300px;
          height: 100vh;
          background-color: #0b0f19;
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-header {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--color-border);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-title {
          font-size: 1.15rem;
          color: var(--color-foreground);
          letter-spacing: 0.5px;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--color-muted-foreground);
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-md) 0;
        }

        .nav-section-title {
          font-size: 0.75rem;
          font-family: var(--font-heading);
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-muted-foreground);
          padding: var(--space-md) var(--space-lg) var(--space-xs);
          opacity: 0.7;
        }

        .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px var(--space-lg);
          color: var(--color-muted-foreground);
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 200ms ease;
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.03);
          color: var(--color-foreground);
        }

        .nav-link.active {
          background-color: rgba(34, 197, 94, 0.08);
          color: var(--color-foreground);
          border-left-color: var(--color-accent);
        }

        .nav-icon {
          margin-right: var(--space-sm);
        }

        .algorithm-list {
          list-style: none;
          margin-top: var(--space-xs);
        }

        .alg-link {
          padding-top: 12px;
          padding-bottom: 12px;
        }

        .alg-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .alg-name {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .alg-type {
          font-size: 0.7rem;
          color: var(--color-muted-foreground);
        }

        .progress-badges {
          display: flex;
          gap: 6px;
        }

        .badge {
          font-size: 0.8rem;
          opacity: 0.2;
          filter: grayscale(100%);
          transition: all 250ms ease;
        }

        .badge.completed {
          opacity: 1;
          filter: grayscale(0%);
          transform: scale(1.1);
        }

        .sidebar-loading {
          padding: var(--space-lg);
          font-size: 0.85rem;
          color: var(--color-muted-foreground);
          text-align: center;
        }

        .sidebar-footer {
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--color-border);
          font-size: 0.75rem;
          color: var(--color-muted-foreground);
          text-align: center;
        }

        .theme-badge {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-accent);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: var(--radius-sm);
          padding: 4px var(--space-sm);
          font-family: var(--font-heading);
          display: inline-block;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
      `}</style>
    </aside>
  );
}
