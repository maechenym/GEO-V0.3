import * as XLSX from "xlsx"
import { formatDateShanghai } from "./date-utils"

export interface ExportData {
  brandName: string
  dates: string[] // YYYY-MM-DD
  values: number[] // 每天的 brandInfluence 值
}

/**
 * 导出品牌影响力数据到 Excel
 */
export async function exportBrandInfluenceToExcel(
  data: ExportData[],
  startDate: string,
  endDate: string
): Promise<void> {
  // 创建工作簿
  const wb = XLSX.utils.book_new()

  // 准备表头：品牌名称 + 日期列表
  const headers = ["品牌名称", ...data[0]?.dates || []]

  // 准备数据行
  const rows = data.map((item) => [
    item.brandName,
    ...item.values.map((val) => (typeof val === "number" ? val : 0)),
  ])

  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // 设置列宽
  const colWidths = [
    { wch: 15 }, // 品牌名称列
    ...(data[0]?.dates || []).map(() => ({ wch: 12 })), // 日期列
  ]
  ws["!cols"] = colWidths

  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, "Brand Influence")

  // 生成文件名
  const fileName = `brand_influence_${startDate}~${endDate}.xlsx`

  // 导出文件
  XLSX.writeFile(wb, fileName)
}

/**
 * 检查是否支持导出（兼容性检查）
 */
export function canExportExcel(): boolean {
  if (typeof window === "undefined") return false

  // 检查是否支持 FileSaver 或 XLSX 的 writeFile
  try {
    return typeof XLSX.writeFile === "function"
  } catch {
    return false
  }
}

/**
 * 导出数据到CSV
 */
export function exportToCSV(
  data: Array<Record<string, any>>,
  filename: string,
  headers?: string[]
): void {
  if (!data || data.length === 0) {
    console.warn("No data to export")
    return
  }

  const csvRows: string[] = []

  // 如果没有提供headers，从第一条数据中提取
  const csvHeaders = headers || Object.keys(data[0])
  csvRows.push(csvHeaders.join(","))

  // 添加数据行
  data.forEach((row) => {
    const values = csvHeaders.map((header) => {
      const value = row[header]
      // 处理包含逗号、引号或换行符的值
      if (value === null || value === undefined) return ""
      const stringValue = String(value)
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvRows.push(values.join(","))
  })

  // 创建CSV内容
  const csvContent = csvRows.join("\n")

  // 创建Blob并下载
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出数据到PDF（使用打印功能）
 */
export function exportToPDF(
  title: string,
  content: string | HTMLElement,
  filename?: string
): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Please allow popups to export PDF")
    return
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 { 
          color: #111827;
          font-size: 24px;
          margin-bottom: 10px;
        }
        h2 { 
          color: #374151;
          font-size: 18px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        table { 
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #e5e7eb;
          padding: 8px;
          text-align: left;
        }
        th { 
          background-color: #f9fafb;
          font-weight: 600;
        }
        .date-range {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
  `

  if (typeof content === "string") {
    html += content
  } else {
    // 如果是HTMLElement，提取其innerHTML
    html += content.innerHTML
  }

  html += `
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()

  // 等待内容加载，然后打印
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

/**
 * 生成带日期范围的PDF内容
 */
export function generatePDFContent(
  title: string,
  dateRange: { start: Date; end: Date },
  sections: Array<{ title: string; content: string }>
): string {
  const dateRangeText = `${formatDateShanghai(dateRange.start)} - ${formatDateShanghai(dateRange.end)}`
  
  let content = `<div class="date-range">Date Range: ${dateRangeText}</div>`
  
  sections.forEach((section) => {
    content += `<h2>${section.title}</h2>`
    content += section.content
  })
  
  return content
}

