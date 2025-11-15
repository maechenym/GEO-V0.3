# Export 功能文档（CSV / PDF / Excel）

> 当前导出功能完全在前端实现（无专门后端 API）。以下文档描述了现有工具函数、输入参数以及未来可扩展的服务接口建议。

## 一、工具函数概览

| 函数 | 定义位置 | 作用 | 主要参数 |
|------|----------|------|----------|
| `exportToCSV(data, filename, headers?)` | `src/lib/export-utils.ts` | 将数组数据导出为 CSV 文件，应用于 Overview/Visibility/Sentiment 等页面顶部的“Export CSV”按钮。 | `data`: `Array<Record<string, any>>`<br>`filename`: string<br>`headers?`: string[]（可选，指定列顺序） |
| `exportToPDF(title, content, filename?)` | 同上 | 使用 `window.print()` 打开新标签页生成可下载的 PDF（或打印）。`content` 可为 HTML 字符串或 DOM 节点。 | `title`: string<br>`content`: string \| HTMLElement<br>`filename?`: string |
| `exportBrandInfluenceToExcel(data, startDate, endDate)` | 同上 | 使用 `xlsx` 库将品牌影响力趋势导出为 Excel。 | `data`: `Array<{ brandName: string; dates: string[]; values: number[] }>`<br>`startDate`: string<br>`endDate`: string |
| `canExportExcel()` | 同上 | 兼容性检查（确认 `window` 环境与 `XLSX.writeFile` 可用）。 | 无 |

## 二、各模块 CSV 表头定义

| 模块 | CSV 表头（顺序） |
|------|------------------|
| Overview | `统计时间, 品牌, 产品, 模型平台, 品牌影响力, 可见度, 情绪` |
| Visibility | `统计时间, 品牌, 产品, 模型平台, Reach, Rank, Focus` |
| Sentiment | `统计时间, 品牌, 产品, 模型平台, 情绪评分, 正向情绪%, 中立情绪%, 负向情绪%` |
| Sources | `统计时间, 品牌, 产品, 模型平台, 来源网站, 网站分类, 是否提及品牌, 提及次数` |
| Queries (Intent) | `统计时间, 品牌, 产品, 模型平台, 核心queries, 模型response, 总查询queries数量, 所属主题, 是否提及本品牌, 品牌排名, 内容占比, 情绪评分` |

> 实现建议：在调用 `exportToCSV` 前先构造与上述表头顺序一致的对象数组，必要时使用 `headers` 参数强制列顺序。

## 三、调用流程（以 Overview 页为例）

1. 用户在 `PageHeaderFilterBar` 中点击 “Export as CSV / PDF”。  
2. 页面收集当前数据（如 KPI、趋势点或表格数据），构造 `Array<Record<string, any>>`。  
3. 调用 `exportToCSV` 或 `exportToPDF`，立即触发浏览器下载。  
4. 若导出品牌影响力趋势，则调用 `exportBrandInfluenceToExcel`，自动生成 `brand_influence_{start}~{end}.xlsx`。

## 四、未来后端 API 建议（可选实现）

| 场景 | 建议接口 | 说明 |
|------|----------|------|
| 大数据量导出（>10k 行） | `POST /api/export/csv`（异步任务） | 后端生成文件并返回下载链接，支持分页/筛选参数。 |
| 自定义 PDF 报告 | `POST /api/export/pdf` | 将 HTML 模板与数据发送到后端，由服务渲染 PDF。 |
| 周期性邮件报告 | `POST /api/export/schedule` | 允许用户配置自动导出并通过邮件发送。 |

## 五、错误与兼容性

- `exportToCSV`：当 `data` 为空时仅警告（`console.warn`），不会抛异常。  
- `exportToPDF`：若浏览器阻止弹窗，会提示用户允许；应在 UI 上给予友好提醒。  
- `exportBrandInfluenceToExcel`：依赖 `window`/`document`，请确保仅在客户端执行。  
- 如需 SSR/Edge 支持，必须将导出逻辑迁移到 API 层。  


