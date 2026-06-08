# 2026-06-08 開發日誌 (Development Log)

本專案已成功將「十大機器學習演算法研讀報告」轉換為具備 OLED Dark Mode 的高質感動態學習平台。以下為今日（2026-06-08）之所有功能調整、全新架構支援與部署之開發記錄。

---

## 🛠️ 今日主要更新項目

### 1. 全新推出：單一網頁外掛連接版 (Standalone HTML)
* **目的**：解決 Next.js 需要安裝 Node.js 與啟動本地伺服器對一般使用者的門檻。
* **實作內容**：在根目錄新增 [interactive_learning.html](file:///d:/AI%20class/0608/HW5/interactive_learning.html)，將所有 10 個互動遊樂場與測驗邏輯完全打包。
* **連線配置**：
  - 新增 **API 後端伺服器網址** 設定功能，使用者可於左側邊欄隨時「套用」本地（`http://127.0.0.1:8000`）或已部署在 Render 等平台的後端 API 位址，直接將學習進度與筆記同步至 SQLite 資料庫。
  - **Offline Fallback**：若未開啟後端，系統會自動切換為離線模式，使用者依然能完整閱讀指引與操作互動遊樂場。

### 2. 全新推出：Streamlit 部署與一鍵託管支援
* **目的**：應使用者需求，提供比 Next.js 更輕量的雲端一鍵部署方案，直接使用 Streamlit Community Cloud 進行線上託管。
* **實作內容**：
  - **[streamlit_app.py](file:///d:/AI%20class/0608/HW5/streamlit_app.py)**：利用 Streamlit 的 Python Entrypoint，讀取 [interactive_learning.html](file:///d:/AI%20class/0608/HW5/interactive_learning.html) 內容，並透過 `st.components.v1.html` 將網頁以隔離的 `iframe` 容器無縫嵌入。
  - **滿版樣式優化**：利用 CSS Overriding 隱藏了 Streamlit 的預設選單 (MainMenu)、頁首、頁尾，並消除邊框與 Padding，完美保留極致的 OLED 暗黑美學。
  - **相容性修復**：解決了使用 `st.iframe` 直接載入本地絕對路徑時，因瀏覽器安全性（CORS 與本地檔案載入保護）導致畫面跑不出來（空白）的問題，改回在 Python端先讀取 HTML 內容字串的穩定方案。
  - **[requirements.txt](file:///d:/AI%20class/0608/HW5/requirements.txt)**：於根目錄新增依賴定義檔（指定 `streamlit`），供 Streamlit Cloud 自動建置。

### 3. 專案說明文件全面重構
* **實作內容**：更新 [README.md](file:///d:/AI%20class/0608/HW5/README.md)，將啟動步驟重構為以下三大方案，讓使用者更易懂：
  - **方案 A**：輕量單網頁版（直接點擊 HTML + FastAPI）
  - **方案 B**：全端開發版（Next.js + FastAPI）
  - **方案 C**：Streamlit 本地與線上部署版（Streamlit + FastAPI 雲端版）
* **同步項目**：在目錄結構樹中加入 [streamlit_app.py](file:///d:/AI%20class/0608/HW5/streamlit_app.py) 與 [requirements.txt](file:///d:/AI%20class/0608/HW5/requirements.txt)。

---

## ☁️ Streamlit 雲端部署疑難排除說明
在協助使用者於 Streamlit Community Cloud 部署的過程中，記錄以下兩個關鍵 Gotchas：
1. **子網域名稱已被佔用 (Subdomain Taken)**：
   - 錯誤表現：顯示紅色警告 `This subdomain is already taken. Please provide an alternative subdomain.`，且 Deploy 按鈕變灰色。
   - 排除方式：在 "App URL" 欄位中更換為其他尚未被註冊的子網域名稱（例如：`l6-hw5-ml-mastery`）。
2. **部署期間的暫時性 404 頁面**：
   - 錯誤表現：剛按下 Deploy 隨即打開 URL 時，會顯示 `You do not have access to this app or it does not exist`。
   - 排除方式：這是 Streamlit Cloud 還在建置容器並安裝依賴套件（約需 1~2 分鐘）的暫時現象。請勿關閉，只需在網頁上靜候或按 `F5` 重新整理，完成後便會自動進入 App 畫面。

---

## 📂 變更檔案清單 (Modified Files)
* [log.md](file:///d:/AI%20class/0608/HW5/log.md) (新增 - 開發日誌)
* [streamlit_app.py](file:///d:/AI%20class/0608/HW5/streamlit_app.py) (修改 - 改用穩定的 components.html)
* [requirements.txt](file:///d:/AI%20class/0608/HW5/requirements.txt) (新增 - Streamlit 依賴)
* [README.md](file:///d:/AI%20class/0608/HW5/README.md) (修改 - 方案分流說明與結構樹)
* [interactive_learning.html](file:///d:/AI%20class/0608/HW5/interactive_learning.html) (微調格式)

---
*記錄時間：2026-06-08 17:07*
