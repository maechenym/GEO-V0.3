import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brands/:brandId/products
 * 
 * Get products for a brand
 * Returns mock data for production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId

  // Mock products for 英业达
  if (brandId === "brand_inventec") {
    return NextResponse.json({
      products: [
        {
          id: "product_1",
          brandId: "brand_inventec",
          name: "机架解决方案",
          description: "英业达机架服务器解决方案",
        },
        {
          id: "product_2",
          brandId: "brand_inventec",
          name: "AI服务器",
          description: "AI服务器产品",
        },
        {
          id: "product_3",
          brandId: "brand_inventec",
          name: "通用服务器",
          description: "通用服务器产品",
        },
        {
          id: "product_4",
          brandId: "brand_inventec",
          name: "存储服务器",
          description: "存储服务器产品",
        },
        {
          id: "product_5",
          brandId: "brand_inventec",
          name: "网络交换机",
          description: "网络交换机产品",
        },
        {
          id: "product_6",
          brandId: "brand_inventec",
          name: "笔记本电脑",
          description: "笔记本电脑产品",
        },
        {
          id: "product_7",
          brandId: "brand_inventec",
          name: "台式机",
          description: "台式机产品",
        },
        {
          id: "product_8",
          brandId: "brand_inventec",
          name: "精简型电脑",
          description: "精简型电脑产品",
        },
      ],
    })
  }

  // Default empty products
  return NextResponse.json({
    products: [],
  })
}

/**
 * POST /api/brands/:brandId/products
 * 
 * Create a new product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId
  const body = await request.json()

  return NextResponse.json({
    product: {
      id: `product_${Date.now()}`,
      brandId: brandId,
      name: body.name || "New Product",
      description: body.description || "",
    },
  })
}

