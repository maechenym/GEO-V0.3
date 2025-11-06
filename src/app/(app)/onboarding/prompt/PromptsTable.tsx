"use client"

import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import type { PromptItem } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PromptsTableProps {
  prompts: PromptItem[]
  onEdit: (prompt: PromptItem) => void
  onRemove: (id: string) => void
}

/**
 * 提示词表格组件
 * 
 * 表格列：Prompt (text 多行显示)、Country、Actions (Edit/Delete)
 */
export function PromptsTable({ prompts, onEdit, onRemove }: PromptsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onRemove(deleteId)
      setDeleteId(null)
    }
  }

  // 国家代码到名称的映射（支持国家码或名称）
  const countryNames: Record<string, string> = {
    US: "United States",
    UK: "United Kingdom",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    CN: "China",
    TW: "Taiwan",
    HK: "Hong Kong",
    SG: "Singapore",
    AU: "Australia",
    IN: "India",
    "United States": "United States",
    "United Kingdom": "United Kingdom",
    Germany: "Germany",
    France: "France",
    Japan: "Japan",
    China: "China",
    Taiwan: "Taiwan",
    "Hong Kong": "Hong Kong",
    Singapore: "Singapore",
    Australia: "Australia",
    India: "India",
  }

  // 获取国家显示名称
  const getCountryName = (country: string) => {
    return countryNames[country] || country
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-white shadow-sm">
        {prompts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Prompt
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Country
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {prompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm whitespace-pre-wrap max-w-md">{prompt.text}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{getCountryName(prompt.country)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(prompt)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          aria-label={`Edit prompt ${prompt.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(prompt.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Delete prompt ${prompt.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p>No prompts yet. Click "Add Prompt" to add one.</p>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个提示词吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

