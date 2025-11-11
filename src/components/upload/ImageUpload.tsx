"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/services/api"

interface ImageUploadProps {
  value?: string | null // Current logo URL
  onChange: (url: string | null) => void
  type?: "brand" | "product" // Upload type
  maxSize?: number // Max file size in bytes (default: 5MB)
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  type = "brand",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, WebP, or SVG image.",
        variant: "destructive",
      })
      return
    }

    // 验证文件大小
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      })
      return
    }

    // 显示预览
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 上传文件
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await apiClient.post<{ ok: boolean; url: string; fileName: string }>("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.ok && response.data.url) {
        onChange(response.data.url)
        toast({
          title: "Upload successful",
          description: "Logo uploaded successfully.",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error?.response?.data?.error || error?.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      })
      // 重置预览
      setPreview(value || null)
    } finally {
      setUploading(false)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <div className="flex items-center gap-4">
        {/* Logo Preview */}
        <div className="relative w-20 h-20 border-2 border-dashed border-ink-300 rounded-lg overflow-hidden bg-ink-50 flex items-center justify-center">
          {preview ? (
            <>
              <img
                src={preview}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-ink-400" />
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : preview ? "Change Logo" : "Upload Logo"}
          </Button>
          <p className="text-xs text-ink-500">
            JPEG, PNG, GIF, WebP, SVG (max {Math.round(maxSize / 1024 / 1024)}MB)
          </p>
        </div>
      </div>
    </div>
  )
}

