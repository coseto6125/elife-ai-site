# e-life-ai · 企業 AI 助理（本地版 demo）

企業內部本地執行的 AI 助理。首頁列出一排「skill」（功能卡），員工選一個、
貼上內容、按一下就拿到結果。連接**企業自己的 Anthropic API Key**，
資料與 Key 都不離開這台電腦。

## 怎麼跑

純前端，無需安裝、無需後端。任選一種：

```bash
# 方式 1：直接用瀏覽器開
open index.html            # macOS
xdg-open index.html        # Linux

# 方式 2：起一個本地 server（建議，避免少數瀏覽器的 file:// 限制）
python3 -m http.server 8080
# 然後開 http://localhost:8080
```

第一次使用點右上角「設定 Key」，貼上 `sk-ant-...`。
Key 只存在這台電腦的瀏覽器 localStorage，不會上傳。

## 怎麼加新功能（skill）

只改一個檔：`skills.js`。複製一個既有的物件、改 5 個欄位即可，
其餘程式不用動。

```js
{
  id: 'unique-key',
  icon: '📦',
  title: '功能名稱',
  blurb: '卡片上的一句話說明',
  input: { label: '輸入框標題', placeholder: '提示文字', multiline: true },
  model: 'claude-haiku-4-5-20251001',   // 行政庶務用 Haiku 即可，便宜快速
  system: '定義這個 skill 行為的 system prompt',
  build: (t) => `送給 AI 的訊息：\n\n${t}`,
}
```

> 商業模式：一張卡 = 一個 skill = 一段可計價的範圍。
> 業主要新功能，就是加一張卡，依範圍另議價格。

## 內建範例 skill

| Skill | 用途 |
|-------|------|
| 信件草稿 | 貼客戶來信 → 產生可寄出的回覆 |
| 會議記錄整理 | 貼逐字稿 → 摘要 + 決議 + 待辦 |
| 規格資料抽取 | 貼規格文字 → 整齊的表格欄位 |

## 給業主的安全說明

- **本地執行**：整個網站是靜態檔，可放在內網或員工電腦，不需對外。
- **Key 不外流**：API Key 存在瀏覽器本地，呼叫直接從瀏覽器送到 Anthropic。
- **資料不留存**：處理完即丟，本程式不儲存任何輸入內容。
