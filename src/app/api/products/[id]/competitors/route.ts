import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * GET /api/products/:productId/competitors
 * 
 * Get competitors for a specific product
 * Reads from data file to get actual competitors (same as brand-level)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+ uses Promise)
    const resolvedParams = await Promise.resolve(params)
    const productId = resolvedParams.id

    // 尝试从数据文件读取竞品列表（与品牌级 API 使用相同逻辑）
    const projectRoot = process.cwd()
    const dataPath = join(projectRoot, "data", "all_products_results_20251120_030450_english.json")
    
    try {
      const fileContent = readFileSync(dataPath, "utf-8")
      const data = JSON.parse(fileContent)
      
      // 获取第一个产品的数据（或根据productId匹配）
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
                brandId: "brand_inventec", // 默认品牌ID
                name: name,
                product: productId,
                region: null,
              }))
            
            // Debug: 检查目标银行是否在列表中
            const targetBanks = ["国泰世华银行", "玉山银行", "台新银行"]
            const foundBanks = competitors.filter(c => targetBanks.includes(c.name))
            console.log("[Product Competitors API] Target banks found:", foundBanks.map(c => c.name))
            console.log("[Product Competitors API] Total competitors:", competitors.length)
            
            return NextResponse.json({
              competitors,
            })
          }
        }
      }
    } catch (fileError) {
      console.error("Error reading data file:", fileError)
      // 如果读取文件失败，回退到空数组
    }

    // Fallback: 返回空数组（如果数据文件读取失败）
    return NextResponse.json({
      competitors: [],
    })
  } catch (error) {
    console.error("Error in GET /api/products/[id]/competitors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products/:productId/competitors
 * 
 * Create a new competitor for a specific product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const productId = resolvedParams.id
  const body = await request.json()

  // In real implementation, get brandId from product
  const brandId = "brand_inventec"

  return NextResponse.json({
    competitor: {
      id: `comp_${Date.now()}`,
      brandId: brandId,
      name: body.name || "New Competitor",
      product: productId,
      region: body.region || null,
    },
  })
}

