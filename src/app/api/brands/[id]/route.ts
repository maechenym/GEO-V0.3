import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brands/:id
 * 
 * Get brand by ID
 * Returns mock data for production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  // Mock brand data for 英业达
  if (id === "brand_inventec") {
    return NextResponse.json({
      brand: {
        id: "brand_inventec",
        name: "英业达 (Inventec)",
        description: "英业达公司产品线",
      },
    })
  }

  // Default brand for other IDs
  return NextResponse.json({
    brand: {
      id: id,
      name: "Brand",
      description: "",
    },
  })
}

