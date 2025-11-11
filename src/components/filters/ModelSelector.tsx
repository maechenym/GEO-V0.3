"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODEL_OPTIONS } from "@/constants/models"
import { useLanguageStore } from "@/store/language.store"
import type { ModelOptionValue } from "@/constants/models"

interface ModelSelectorProps {
  value: ModelOptionValue | string
  onValueChange: (value: ModelOptionValue) => void
  className?: string
}

export function ModelSelector({ value, onValueChange, className }: ModelSelectorProps) {
  const { language } = useLanguageStore()

  const selectedModelOption =
    MODEL_OPTIONS.find((option) => option.value === value) ?? MODEL_OPTIONS[0]
  const selectedModelLabel =
    language === "zh-TW" ? selectedModelOption.labelZh : selectedModelOption.labelEn

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className || "w-[140px] h-9 text-xs border-ink-200 hover:border-ink-300 transition-colors min-h-[44px] sm:min-h-0"}>
        <SelectValue>{selectedModelLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MODEL_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {language === "zh-TW" ? option.labelZh : option.labelEn}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

