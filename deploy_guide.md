# 前後端免警告免費部署指南 (Vercel + Render)

本指南將指引您如何將專案正式部署至雲端託管服務。部署完成後，您將獲得**完全沒有任何警告頁面**、效能更穩定且載入快速的公開網址（前端 `https://*.vercel.app` 與後端 `https://*.onrender.com`）。

由於專案代碼已經成功推送到您的 GitHub 儲存庫 `https://github.com/ian0629082/L6-HW5-Machine-Learning.git`，您可以直接使用該儲存庫進行一鍵部署。

---

## 第一步：部署後端 API (FastAPI) 至 Render.com

[Render](https://render.com) 提供非常便利的 Python 免費託管服務。

### 步驟說明：
1. 註冊並登入 [Render.com](https://render.com)（推薦直接使用 **GitHub 帳號** 登入）。
2. 在儀表板右上角點擊 **"New +"**，選擇 **"Web Service"**。
3. 連結您的 GitHub 帳號，並在儲存庫清單中選擇 **`L6-HW5-Machine-Learning`**。
4. 設定 Web Service 參數（**關鍵步驟**，因為後端在子目錄中）：
   * **Name**：輸入一個服務名稱（如 `ml-mastery-backend`）。
   * **Region**：選擇靠近台灣的區域（如 `Singapore` 或 `Oregon`）。
   * **Branch**：選擇 `main`。
   * **Root Directory**：輸入 **`backend`**（這會讓 Render 只看 `backend/` 資料夾中的代碼）。
   * **Runtime**：選擇 **`Python`**。
   * **Build Command**：`pip install -r requirements.txt`
   * **Start Command**：`uvicorn main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**：選擇 **`Free`**。
5. 點擊最下方的 **"Create Web Service"** 開始部署。
6. **取得後端網址**：編譯部署約需 2~3 分鐘。部署完成後，網頁左上方會顯示您的 API 網址，格式如：
   `https://ml-mastery-backend.onrender.com`

> [!WARNING]
> **關於 SQLite 本地資料庫在 Render 免費方案的特性**
> Render 的免費方案 (Free Web Service) 不包含持久化硬碟。這意味著寫入 SQLite 的學習筆記和進度，會在後端伺服器每日重啟時被清空。
> * **測試與 demo 用途**：直接使用默認 SQLite 即可，方便快速。
> * **正式持久保存用途**：建議可在 Render 建立免費的 PostgreSQL 資料庫，並修改後端代碼中的連線方式。

---

## 第二步：部署前端 (Next.js) 至 Vercel.com

[Vercel](https://vercel.com) 是 Next.js 官方的免費託管平台，能完美支援 App Router 編譯。

### 步驟說明：
1. 註冊並登入 [Vercel.com](https://vercel.com)（推薦使用 **GitHub 帳號** 註冊，以便直接綁定專案）。
2. 進入儀表板後，點擊 **"Add New..."** 選擇 **"Project"**。
3. 在儲存庫清單中點擊 **`L6-HW5-Machine-Learning`** 旁邊的 **"Import"**。
4. 設定專案參數（**關鍵步驟**，因為前端在子目錄中）：
   * **Framework Preset**：會自動偵測為 **`Next.js`**。
   * **Root Directory**：點擊 "Edit" 並選擇 **`frontend`** 目錄。
5. 展開 **"Environment Variables"** (環境變數) 區塊，加入您的後端 API 網址：
   * **Key**：`NEXT_PUBLIC_API_URL`
   * **Value**：貼上您在**第一步**取得的 Render 後端網址（如：`https://ml-mastery-backend.onrender.com`）。
   * 點擊 **"Add"** 加入。
6. 點擊 **"Deploy"** 開始編譯。
7. **大功告成！** 編譯約需 1~2 分鐘。完成後 Vercel 會提供您一組漂亮的網址（如 `https://frontend-xxx.vercel.app`），即可直接點入使用，絕無任何 localtunnel 的安全警告警告頁！

---

## 🔄 日後更新代碼
未來如果您對代碼進行了任何修改並 `git push` 到 GitHub：
* **Vercel** 與 **Render** 都會透過 Webhook 機制**自動偵測並重新編譯部署**。
* 您完全不需要手動做任何事情，網頁會自動更新為最新狀態！
