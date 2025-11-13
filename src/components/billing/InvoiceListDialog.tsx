"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, ExternalLink, Calendar } from "lucide-react"
import { useLanguageStore } from "@/store/language.store"
import { translate } from "@/lib/i18n"
import apiClient from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"

interface Invoice {
  id: string
  number: string | null
  amount_paid: number
  amount_due: number
  currency: string
  status: string
  created: number
  period_start: number
  period_end: number
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  description: string | null
}

interface InvoiceListResponse {
  invoices: Invoice[]
  has_more: boolean
}

interface InvoiceListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceListDialog({ open, onOpenChange }: InvoiceListDialogProps) {
  const { language } = useLanguageStore()

  // 获取账单列表
  const { data, isLoading, error } = useQuery<InvoiceListResponse>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await apiClient.get("/api/stripe/invoices")
      return response.data
    },
    enabled: open, // 只在对话框打开时获取数据
    staleTime: 5 * 60 * 1000,
  })

  // 格式化金额（从 cents 转换为美元）
  const formatAmount = (cents: number, currency: string = "usd") => {
    const amount = cents / 100
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString(language === "zh-TW" ? "zh-TW" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      paid: {
        label: language === "zh-TW" ? "已支付" : "Paid",
        variant: "default",
      },
      open: {
        label: language === "zh-TW" ? "待支付" : "Open",
        variant: "secondary",
      },
      void: {
        label: language === "zh-TW" ? "已作废" : "Void",
        variant: "outline",
      },
      uncollectible: {
        label: language === "zh-TW" ? "无法收取" : "Uncollectible",
        variant: "destructive",
      },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "outline" as const,
    }

    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    )
  }

  // 处理下载 PDF
  const handleDownloadPDF = (invoice: Invoice) => {
    if (invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, "_blank")
    } else if (invoice.hosted_invoice_url) {
      window.open(invoice.hosted_invoice_url, "_blank")
    }
  }

  // 处理查看在线账单
  const handleViewOnline = (invoice: Invoice) => {
    if (invoice.hosted_invoice_url) {
      window.open(invoice.hosted_invoice_url, "_blank")
    } else if (invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === "zh-TW" ? "账单历史" : "Billing History"}
          </DialogTitle>
          <DialogDescription>
            {language === "zh-TW"
              ? "查看您的订阅付费账单记录"
              : "View your subscription billing history"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                {language === "zh-TW" ? "載入中..." : "Loading..."}
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-sm text-destructive">
                {language === "zh-TW"
                  ? "無法載入账单記錄，請稍後再試"
                  : "Failed to load invoices. Please try again later."}
              </p>
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              {data.invoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    {language === "zh-TW" ? "暫無账单記錄" : "No invoices found"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.invoices.map((invoice) => (
                    <Card key={invoice.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">
                              {invoice.number || invoice.id}
                            </h4>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {invoice.description || translate("Subscription", language)}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                              </span>
                            </div>
                            <div className="font-semibold text-foreground">
                              {formatAmount(invoice.amount_paid, invoice.currency)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {invoice.invoice_pdf && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(invoice)}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              {language === "zh-TW" ? "下載" : "Download"}
                            </Button>
                          )}
                          {invoice.hosted_invoice_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOnline(invoice)}
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {language === "zh-TW" ? "查看" : "View"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

