# 十大機器學習演算法動態學習平台

**Live Demo**: https://dark-plums-yawn.loca.lt

本專案將「十大機器學習演算法研讀報告」轉換為一個現代化、高質感的動態互動學習平台。
使用者可以透過首頁儀表板的**決策精靈**與**學習地圖**進行引導，並深入研讀十種核心機器學習演算法的課程導引、操作**動態數學遊樂場**、進行**觀念挑戰測驗**，並將個人研讀筆記與學習進度持久化儲存於 **SQLite 資料庫**中。

---

## 🚀 專案特色

1. **研讀指引 (Study Guide)**：整合報告中 10 種演算法的核心概念、運作流程、實務案例與優缺點。
2. **互動遊樂場 (Interactive Playground)**：為 10 種演算法量身打造的視覺化互動元件（例如：調整線性迴歸斜率/截距以降低平方誤差、點擊 KNN 空間進行投票分類、K-Means 迭代步驟動畫、主成分分析旋轉軸等）。
3. **觀念挑戰測驗 (Quiz Challenge)**：對接後端 API 批改答題，答對率達 60%（答對 2 題以上）即解鎖該章節進度，並提供詳盡解析。
4. **個人筆記與進度持久化**：使用 **FastAPI + SQLite** 在背景保存使用者的「已研讀」、「已做遊樂場」、「已通過測驗」進度狀態，以及在網頁輸入的「個人研讀筆記」。
5. **決策精靈與 SVG 學習地圖**：提供互動式問答精靈以推薦首選演算法，並提供動態 SVG 學習路線圖，依學習進度動態將節點點亮綠燈。
6. **UI/UX 設計系統**：套用 **UI/UX Pro Max (OLED Dark Mode)** 設計規範，以黑灰綠為核心配色，引入 Fira Code / Fira Sans 字型，呈現專業精美的開發者風格。

---

## 🛠️ 技術棧

* **前端 (Frontend)**：
  - **Next.js 14.2.15** (App Router)
  - **TypeScript**
  - **Vanilla CSS & Styled-JSX** (UI/UX Pro Max OLED Dark Theme)
* **後端 (Backend)**：
  - **FastAPI** (Python 3.x / 3.14+)
  - **Uvicorn** (ASGI Web 伺服器)
  - **SQLite** (輕量化資料持久化庫)

---

## 📂 專案目錄結構

```text
├── backend/                       # FastAPI 後端專案
│   ├── .venv/                     # Python 虛擬環境
│   ├── database.db                # SQLite 本地資料庫 (自動生成)
│   ├── database.py                # 資料庫連線設定與資料表初始化
│   ├── algorithms_data.py         # 十大演算法結構化知識庫與題庫
│   ├── main.py                    # API 路由與主程式入口
│   └── requirements.txt           # 後端 Python 依賴包
│
├── frontend/                      # Next.js 前端專案
│   ├── app/                       # App Router 路由頁面
│   │   ├── algorithm/[id]/        # 演算法學習專頁 (Study, Playground, Quiz)
│   │   ├── globals.css            # OLED 主題設計變數與全域 CSS
│   │   ├── layout.tsx             # 根佈局設定
│   │   └── page.tsx               # 儀表板首頁 (決策精靈、學習地圖)
│   ├── components/                # 共享元件
│   │   └── Sidebar.tsx            # 左側進度追蹤導覽列
│   ├── next.config.js             # Next.js 設定檔
│   └── package.json               # 前端 npm 依賴與指令
│
└── design-system/                 # 由 UI/UX 技能產生的設計系統文件
    └── ml-mastery/
        └── MASTER.md              # 全域 UI 設計規範 (OLED Dark Theme)
```

---

## 📦 安裝與啟動步驟

本專案需要本機安裝有 **Node.js (v18+)** 與 **Python (3.9+)**。

### 1. 啟動後端服務 (FastAPI)

1. 進入 `backend` 目錄：
   ```bash
   cd backend
   ```
2. 啟動並進入虛擬環境 (Windows PowerShell)：
   ```powershell
   .venv\Scripts\activate
   ```
3. 啟動 FastAPI 伺服器：
   ```bash
   python main.py
   ```
   後端將運行於：`http://127.0.0.1:8000`

---

### 2. 啟動前端網頁 (Next.js)

1. 打開另一個終端機窗口，進入 `frontend` 目錄：
   ```bash
   cd frontend
   ```
2. 安裝套件依賴：
   ```bash
   npm install
   ```
3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   前端網頁將運行於：[**`http://localhost:3000`**](http://localhost:3000)

---

## 🧪 驗證與操作說明

1. 開啟瀏覽器訪問 [**`http://localhost:3000`**](http://localhost:3000)。
2. **決策精靈**：在首頁點選問題答案（例如：有標籤 -> 連續數值），觀察精靈是否推薦「線性迴歸」並提供跳轉連結。
3. **研讀指引**：點擊左側任意演算法（如：`線性迴歸`），閱讀核心概念後點擊最下方的「標記研讀完成」，觀察左側邊欄該演算法旁邊的 `📖` 圖示是否變綠。
4. **互動演練**：切換到 `互動演練遊樂場` 頁籤，操作拉桿或點擊畫布，完成動作後，左側的 `🧪` 實驗瓶圖示將變綠解鎖。
5. **挑戰測驗**：切換到 `觀念挑戰測驗` 頁籤答題，答完 3 題後點擊「送出測驗答案」。若答對 2 題以上，左側的 `📝` 筆記圖示將變綠解鎖，並可看到詳細的公式解析。
6. **保存筆記**：在任何演算法專頁底部的筆記框輸入一些文字，點擊「儲存筆記」，重新整理頁面後，確認您的筆記已被成功從後端 SQLite 資料庫載入回來。

