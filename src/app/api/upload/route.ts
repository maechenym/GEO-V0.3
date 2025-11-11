import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomBytes } from "crypto"

/**
 * POST /api/upload
 * 
 * Upload file (logo/image) to server
 * 
 * 支持的文件类型：image/jpeg, image/png, image/gif, image/webp, image/svg+xml
 * 最大文件大小：5MB
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null // "brand" or "product"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed." },
        { status: 400 }
      )
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const fileExt = file.name.split(".").pop() || "png"
    const fileName = `${randomBytes(16).toString("hex")}.${fileExt}`
    const uploadDir = type === "product" ? "products" : "brands"
    const uploadPath = path.join(process.cwd(), "public", "uploads", uploadDir)

    // 确保上传目录存在
    try {
      await mkdir(uploadPath, { recursive: true })
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 保存文件
    const filePath = path.join(uploadPath, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 返回文件URL
    const fileUrl = `/uploads/${uploadDir}/${fileName}`

    return NextResponse.json({
      ok: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error("[Upload API] Error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Failed to upload file",
      },
      { status: 500 }
    )
  }
}

