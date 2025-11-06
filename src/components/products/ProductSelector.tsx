"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/types/products"

interface ProductSelectorProps {
  products: Product[]
  selectedProductId: string | null
  onProductChange: (productId: string | null) => void
}

export function ProductSelector({
  products,
  selectedProductId,
  onProductChange,
}: ProductSelectorProps) {
  return (
    <Select value={selectedProductId || undefined} onValueChange={onProductChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select product" />
      </SelectTrigger>
      <SelectContent>
        {products.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No products</div>
        ) : (
          products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

