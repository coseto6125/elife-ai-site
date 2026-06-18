# 提案版面系統 (proposals/)

e-life-ai 接案報價提案的共用版面。亮底信賴感 × mint→indigo 品牌色 × 深色品牌 footer，內容區帶 `e-life-ai.com` 斜向浮水印，可列印成乾淨 PDF。

## 檔案

| 檔案 | 用途 |
|------|------|
| `assets/proposal.css` | 共用樣式（品牌、版型、所有區塊元件、浮水印、footer、列印）。**所有提案共用，改它會影響全部。** |
| `_template.html` | 空白範本。開新提案複製這支。 |
| `index.html` | 範例：LINE LIFF 訂單系統（案件 TK26061314BBNV95）。 |

## 開一份新提案

```bash
cp _template.html <案件編號>.html        # 例：cp _template.html TK26070101ABCD.html
```

然後只改 HTML 內容（標題、chip、各 `<section>`）；**不要改 CSS**，版型靠 class 自動套。

## 可用區塊（class）

- `header.cover` — 封面（logo lockup + 標題 + meta chips）
- `<section>` + `h2.sec` + `span.sec-no` — 編號區塊（sec-no 數字自己依序填）
- `table` — 表格；`th.num`/`td.num`（窄編號欄）、`th.pct`/`td.pct`（右對齊占比欄）
- `ol.confirm > li` — 編號圓圈卡（確認事項）
- `pre.diagram` — 深色 ASCII 架構圖
- `.card` / `.why-grid` — 卡片 / 卡片網格
- `ul.plain`（✓）/ `ul.plain.exclude`（✕）— 勾選 / 排除清單
- `.price-note`（藍）/ `.callout`（橘，提醒相依）

## 排版地雷

句中粗體 `<b>` 若緊接標點（。，），折行時標點會被擠到行首。**把標點收進 `<b>` 內**：
`<b>無法由系統自行產製。</b>` ✓ ／ `<b>無法由系統自行產製</b>。` ✗

## 預覽與轉 PDF

playwright 禁 `file://`，要起 http server：

```bash
cd /home/enor/digital-oasis-site && python -m http.server 8080
# 開 http://localhost:8080/proposals/<檔名>.html → 瀏覽器列印 → 另存 PDF
```

列印時 CSS 會自動：關掉浮水印底紋、footer 反白成白底、移除陰影，輸出乾淨。
