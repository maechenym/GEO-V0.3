import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/brands
 * 
 * Get all brands
 * Returns mock data for production
 */
export async function GET(request: NextRequest) {
  // Mock brands list
  return NextResponse.json({
    brands: [
      {
        id: "brand_inventec",
        name: "英业达 (Inventec)",
      },
    ],
  })
}

/**
 * POST /api/brands
 * 
 * Create a new brand
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return NextResponse.json({
    brand: {
      id: `brand_${Date.now()}`,
      name: body.name || "New Brand",
    },
  })
}

