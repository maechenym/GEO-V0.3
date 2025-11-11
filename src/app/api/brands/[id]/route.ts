import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brands/:id
 * 
 * Get brand by ID
 * Returns mock data for production
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id

  // Mock brand data for 英业达
  if (id === "brand_inventec") {
    return NextResponse.json({
      brand: {
        id: "brand_inventec",
        name: "英业达 (Inventec)",
        description: "英业达公司产品线",
        logo: null,
        website: null,
      },
    })
  }

  // Default brand for other IDs
  return NextResponse.json({
    brand: {
      id: id,
      name: "Brand",
      description: "",
      logo: null,
      website: null,
    },
  })
}

/**
 * PATCH /api/brands/:id
 * 
 * Update brand by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  const body = await request.json()

  // TODO: Update brand in database
  // For now, return updated brand data
  return NextResponse.json({
    brand: {
      id: id,
      name: body.name || "Brand",
      description: body.description ?? null,
      logo: body.logo ?? null,
      website: body.website ?? null,
    },
  })
}
