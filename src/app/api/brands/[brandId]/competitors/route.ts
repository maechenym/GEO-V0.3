import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brands/:brandId/competitors
 * 
 * Get competitors for a brand
 * Returns mock data for production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId

  // Mock competitors for 英业达
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
}

/**
 * POST /api/brands/:brandId/competitors
 * 
 * Create a new competitor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId
  const body = await request.json()

  return NextResponse.json({
    competitor: {
      id: `comp_${Date.now()}`,
      brandId: brandId,
      name: body.name || "New Competitor",
    },
  })
}

