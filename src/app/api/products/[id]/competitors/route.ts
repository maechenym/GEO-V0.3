import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/products/:productId/competitors
 * 
 * Get competitors for a specific product
 * Returns mock data for production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const productId = resolvedParams.id

  // Mock competitors for different products
  // In real implementation, this would query the database based on productId
  const competitorsByProduct: Record<string, any[]> = {
    // 机架解决方案 (product_1)
    "product_1": [
      { id: "comp_1", brandId: "brand_inventec", name: "HPE", product: "product_1", region: null },
      { id: "comp_2", brandId: "brand_inventec", name: "超微", product: "product_1", region: null },
      { id: "comp_3", brandId: "brand_inventec", name: "戴尔", product: "product_1", region: null },
      { id: "comp_4", brandId: "brand_inventec", name: "Lenovo", product: "product_1", region: null },
      { id: "comp_5", brandId: "brand_inventec", name: "Cisco", product: "product_1", region: null },
    ],
    // AI服务器 (product_2)
    "product_2": [
      { id: "comp_6", brandId: "brand_inventec", name: "HPE", product: "product_2", region: null },
      { id: "comp_7", brandId: "brand_inventec", name: "NVIDIA", product: "product_2", region: null },
      { id: "comp_8", brandId: "brand_inventec", name: "浪潮", product: "product_2", region: null },
      { id: "comp_9", brandId: "brand_inventec", name: "华为", product: "product_2", region: null },
    ],
    // 通用服务器 (product_3)
    "product_3": [
      { id: "comp_10", brandId: "brand_inventec", name: "HPE", product: "product_3", region: null },
      { id: "comp_11", brandId: "brand_inventec", name: "华硕", product: "product_3", region: null },
      { id: "comp_12", brandId: "brand_inventec", name: "联想", product: "product_3", region: null },
    ],
    // 存储服务器 (product_4)
    "product_4": [
      { id: "comp_13", brandId: "brand_inventec", name: "HPE", product: "product_4", region: null },
      { id: "comp_14", brandId: "brand_inventec", name: "戴尔", product: "product_4", region: null },
      { id: "comp_15", brandId: "brand_inventec", name: "NetApp", product: "product_4", region: null },
    ],
    // 网络交换机 (product_5)
    "product_5": [
      { id: "comp_16", brandId: "brand_inventec", name: "Cisco", product: "product_5", region: null },
      { id: "comp_17", brandId: "brand_inventec", name: "华为", product: "product_5", region: null },
      { id: "comp_18", brandId: "brand_inventec", name: "新华三", product: "product_5", region: null },
    ],
    // 笔记本电脑 (product_6)
    "product_6": [
      { id: "comp_19", brandId: "brand_inventec", name: "联想", product: "product_6", region: null },
      { id: "comp_20", brandId: "brand_inventec", name: "华硕", product: "product_6", region: null },
      { id: "comp_21", brandId: "brand_inventec", name: "惠普", product: "product_6", region: null },
    ],
    // 台式机 (product_7)
    "product_7": [
      { id: "comp_22", brandId: "brand_inventec", name: "联想", product: "product_7", region: null },
      { id: "comp_23", brandId: "brand_inventec", name: "戴尔", product: "product_7", region: null },
      { id: "comp_24", brandId: "brand_inventec", name: "惠普", product: "product_7", region: null },
    ],
    // 精简型电脑 (product_8)
    "product_8": [
      { id: "comp_25", brandId: "brand_inventec", name: "联想", product: "product_8", region: null },
      { id: "comp_26", brandId: "brand_inventec", name: "华硕", product: "product_8", region: null },
    ],
  }

  // Get competitors for the specific product, or return empty array
  const competitors = competitorsByProduct[productId] || []

  return NextResponse.json({
    competitors,
  })
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

