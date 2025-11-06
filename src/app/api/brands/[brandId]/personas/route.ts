import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brands/:brandId/personas
 * 
 * Get personas for a brand
 * Returns mock data for production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId

  // Mock personas for 英业达
  if (brandId === "brand_inventec") {
    return NextResponse.json({
      personas: [],
    })
  }

  // Default empty personas
  return NextResponse.json({
    personas: [],
  })
}

/**
 * POST /api/brands/:brandId/personas
 * 
 * Create a new persona
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const brandId = params.brandId
  const body = await request.json()

  return NextResponse.json({
    persona: {
      id: `persona_${Date.now()}`,
      brandId: brandId,
      name: body.name || "New Persona",
      description: body.description || "",
    },
  })
}

