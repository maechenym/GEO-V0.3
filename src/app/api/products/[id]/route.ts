import { NextRequest, NextResponse } from "next/server"

/**
 * PATCH /api/products/:id
 * 
 * Update product by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  const body = await request.json()

  // TODO: Update product in database
  // For now, return updated product data
  return NextResponse.json({
    product: {
      id: id,
      brandId: body.brandId || "brand_inventec",
      name: body.name || "Product",
      category: body.category ?? null,
      active: body.active !== undefined ? body.active : true,
      logo: body.logo ?? null,
    },
  })
}

/**
 * DELETE /api/products/:id
 * 
 * Delete product by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Handle both sync and async params (Next.js 15+ uses Promise)
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id

  // TODO: Delete product from database
  // For now, return success
  return NextResponse.json({
    ok: true,
    message: "Product deleted successfully",
  })
}

