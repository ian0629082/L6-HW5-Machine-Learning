import streamlit as st
import streamlit.components.v1 as components
import os

# 設定 Streamlit 頁面寬版顯示與標題
st.set_page_config(
    page_title="十大機器學習演算法動態學習平台",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 隱藏 Streamlit 的預設選單、頁尾與 Header，並消除內邊距，達到 OLED 滿版效果
hide_st_style = """
<style>
    /* 隱藏 Streamlit 的 Header 與 Footer */
    header {visibility: hidden;}
    footer {visibility: hidden;}
    #MainMenu {visibility: hidden;}
    
    /* 消除 Streamlit 預設的 Padding，讓網頁完美滿版 */
    .block-container {
        padding: 0rem !important;
        max-width: 100% !important;
        height: 100vh !important;
    }
    
    /* 移除 Streamlit 底部多餘空間 */
    div[data-testid="stVerticalBlock"] > div {
        padding: 0px !important;
    }
    
    /* 設定 iframe 樣式以實現無縫嵌入 */
    iframe {
        border: none !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
    }
</style>
"""
st.markdown(hide_st_style, unsafe_allow_html=True)

# 讀取本地的單一 HTML 檔案並渲染
html_path = os.path.join(os.path.dirname(__file__), "interactive_learning.html")

if os.path.exists(html_path):
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    
    # 使用 streamlit.components.v1.html 嵌入
    # 高度設為 950 像素，並開啟 scrolling 以支援在 iframe 內順暢滾動
    components.html(html_content, height=950, scrolling=True)
else:
    st.error("找不到 `interactive_learning.html` 檔案。請確保該檔案存在於專案根目錄下。")
