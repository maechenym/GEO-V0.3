import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * GET /api/brands/:brandId/competitors
 * 
 * Get competitors for a brand
 * Reads from data file to get actual competitors
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+ uses Promise)
    const resolvedParams = await Promise.resolve(params)
    const brandId = resolvedParams.id // 使用 id 作为 brandId

    // 尝试从数据文件读取竞品列表
    const projectRoot = process.cwd()
    const dataPath = join(projectRoot, "data", "all_products_results_20251120_030450_english.json")
    
    try {
      const fileContent = readFileSync(dataPath, "utf-8")
      const data = JSON.parse(fileContent)
      
      // 获取第一个产品的数据（或根据brandId匹配）
      const productKeys = Object.keys(data)
      if (productKeys.length > 0) {
        const firstProduct = data[productKeys[0]]
        if (firstProduct && firstProduct.length > 0) {
          const lastDay = firstProduct[firstProduct.length - 1]
          const overall = lastDay[1]?.overall
          
          if (overall && overall.mention_rate) {
            // 获取所有品牌名称（排除自品牌）
            const selfBrandCandidates = ["中国信托", "中國信托", "CTBC", "ctbc", "英业达", "Inventec"]
            const allBrands = Object.keys(overall.mention_rate)
            
            // 识别自品牌
            let selfBrand = null
            for (const brand of allBrands) {
              if (selfBrandCandidates.some(candidate => 
                brand === candidate || 
                brand.includes(candidate) ||
                candidate.includes(brand)
              )) {
                selfBrand = brand
                break
              }
            }
            
            // 过滤掉自品牌，生成竞品列表
            const competitors = allBrands
              .filter(name => name !== selfBrand)
              .map((name, index) => ({
                id: `comp_${index + 1}`,
                brandId: brandId,
                name: name,
              }))
            
            // Debug: 检查目标银行是否在列表中
            const targetBanks = ["国泰世华银行", "玉山银行", "台新银行"]
            const foundBanks = competitors.filter(c => targetBanks.includes(c.name))
            console.log("[Competitors API] Target banks found:", foundBanks.map(c => c.name))
            console.log("[Competitors API] Total competitors:", competitors.length)
            console.log("[Competitors API] Self brand:", selfBrand)
            
            return NextResponse.json({
              competitors,
            })
          }
        }
      }
    } catch (fileError) {
      console.error("Error reading data file:", fileError)
      // 如果读取文件失败，回退到硬编码数据
    }

    // Fallback: Mock competitors for 英业达 (如果数据文件读取失败)
    if (brandId === "brand_inventec") {
      return NextResponse.json({
        competitors: [
          { id: "comp_1", brandId: "brand_inventec", name: "HPE" },
          { id: "comp_2", brandId: "brand_inventec", name: "超微" },
          { id: "comp_3", brandId: "brand_inventec", name: "华硕" },
          { id: "comp_4", brandId: "brand_inventec", name: "浪潮" },
          { id: "comp_5", brandId: "brand_inventec", name: "戴尔" },
          { id: "comp_6", brandId: "brand_inventec", name: "Lenovo" },
          { id: "comp_7", brandId: "brand_inventec", name: "Cisco" },
          { id: "comp_8", brandId: "brand_inventec", name: "Huawei" },
          { id: "comp_9", brandId: "brand_inventec", name: "惠普" },
          { id: "comp_10", brandId: "brand_inventec", name: "联想" },
          { id: "comp_11", brandId: "brand_inventec", name: "华为" },
          { id: "comp_12", brandId: "brand_inventec", name: "新华三" },
        ],
      })
    }

    // Default empty competitors
    return NextResponse.json({
      competitors: [],
    })
  } catch (error) {
    console.error("Error in GET /api/brands/[id]/competitors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brands/:brandId/competitors
 * 
 * Create a new competitor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const brandId = resolvedParams.id // 使用 id 作为 brandId
  const body = await request.json()

  return NextResponse.json({
    competitor: {
      id: `comp_${Date.now()}`,
      brandId: brandId,
      name: body.name || "New Competitor",
    },
  })
}

