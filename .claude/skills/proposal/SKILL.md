---
name: proposal
description: 為 e-life-ai（數位綠洲）接案平台寫報價提案、部署上線到 service.e-life-ai.com、並啟用瀏覽追蹤的完整流程。當使用者貼出接案平台的需求/截圖、說「生提案」「寫提案」「報價提案」「proposal」，或要把寫好的提案部署上線時使用。
---

# 接案提案：撰寫 → 部署 → 追蹤

完整流程分三段：**寫提案**（判斷，本文件指引）→ **部署上線**（一鍵 script）→ **追蹤**（自動）。

## 一、寫提案

### 開場先釐清，不要悶頭寫
案件資訊常不足以決定架構。先針對「影響方案選型的分岔」問 2~4 個關鍵問題（用 AskUserQuestion），例如：來源格式一致性、是否需 AI/OCR、硬體限制、輸出規模、預算彈性。能從需求/截圖自行判斷的就別問。

### 對齊既有版面與語氣
- 範本：`proposals/_template.html`（HTML）、近期提案 `.md`（如 `proposals/TK*-*.md`）。版面系統說明見 `proposals/README.md`。
- 產兩份：`proposals/<案號>-<slug>.md`（純文字，貼平台/email）+ `proposals/<案號>-<slug>.html`（套版、**必加 `<meta name="robots" content="noindex">`**、可印 PDF）。
- HTML 不要改 `assets/proposal.css`；版型靠既有 class（cover/sec/sec-no/table/confirm/diagram/card/why-grid/plain/exclude/price-note/callout）。

### 語氣規範（沉穩商業提案，硬性）
- **第一人稱一律「我們」**，不用「本團隊」、不用獨白式「我」。
- **不用破折號**（——／—）；句中用「，」、列舉用「：」、標題分隔用「｜」。
- **去口語**：不用「喬掉/搶著抽/瞄一眼/怪怪的/不用碰/吃不準/搞定/划算」這類；用書面語。
- **不揭露特定技術名**給案主（不寫 RapidOCR/PaddleOCR/Ollama/llama.cpp/具體參數量/judge 等）；改用能力描述（「成熟的本地 OCR 引擎」「輕量本地小模型」）。實績說「我們曾產出之商業成品」，不用「出貨」。
- 報價誠實掛條件：把「需先取得的素材/範例」設為正式報價前提，不把不確定的範圍講死。

### 競爭策略
低預算小工具案靠「一眼看出我們最懂這題」取勝，不靠堆功能：把案主的模糊用詞翻譯成專業概念、給務實的選型、誠實的報價條件。

## 二、部署上線（一鍵）

提案 HTML 寫好後，從 repo 根目錄執行：

```bash
.claude/skills/proposal/deploy-proposal.sh proposals/<案號>-<slug>.html "<案件編號或客戶名>"
```

它全自動完成：產 demo hash → 在 `app/public/demo/<hash>/` 建自包含版本（轉資產路徑、注入帶 label 的追蹤 beacon）→ commit + push main → 等 Pages 部署 → 登記追蹤 → 印出 demo / stats 網址。

**為什麼不是放 proposals/ 就好**：GitHub Pages 只 build `app/`（→ `app/dist`），根目錄 `proposals/` 不會上線。真正上線的是 `app/public/demo/<hash>/`，對應不可猜的 `/demo/<hash>/` 網址（noindex，適合私下發客戶）。部署只在 **push main** 時觸發。

## 三、追蹤（自動）

部署 script 已登記，提案頁載入時自動記錄。查看：

- 全部提案總覽：`https://service.e-life-ai.com/stats/`
- 單一提案：`https://service.e-life-ai.com/stats/?p=<hash>`

只記開啟次數與時間（台灣時間），無 cookie/IP/個資。機制建在 `elife-ai-contact` Worker + KV，看板頁在 `app/public/stats/index.html`。新提案無需改 Worker。

## 交付收尾
給使用者：demo 網址（發客戶用）+ stats 網址（自己看點擊）。需要時再提供 email 模板（收件人若為 Outlook/Hotmail，避免現代 CSS，用純文字或 table 排版）。
