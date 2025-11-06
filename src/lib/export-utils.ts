import * as XLSX from "xlsx"

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

