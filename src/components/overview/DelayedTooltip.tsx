"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DelayedTooltipProps {
  children: React.ReactElement
  content: string
  delay?: number
  mobileDelay?: number
}

/**
 * 延时显示的 Tooltip 组件
 * - 桌面端：鼠标停留 1000ms 后显示
 * - 移动端：长按 600ms 后显示
 * - 键盘：焦点时按 ? 或 Enter 触发
 */
export function DelayedTooltip({
  children,
  content,
  delay = 1000,
  mobileDelay = 600,
}: DelayedTooltipProps) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const longPressRef = useRef(false)
  const touchStartRef = useRef<number | null>(null)

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearTimeoutRef()
    timeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, delay)
  }, [delay, clearTimeoutRef])

  const handleMouseLeave = useCallback(() => {
    clearTimeoutRef()
    setOpen(false)
  }, [clearTimeoutRef])

  const handleTouchStart = useCallback(() => {
    touchStartRef.current = Date.now()
    longPressRef.current = false
    clearTimeoutRef()
    timeoutRef.current = setTimeout(() => {
      longPressRef.current = true
      setOpen(true)
    }, mobileDelay)
  }, [mobileDelay, clearTimeoutRef])

  const handleTouchEnd = useCallback(() => {
    clearTimeoutRef()
    if (!longPressRef.current) {
      setOpen(false)
    }
    touchStartRef.current = null
  }, [clearTimeoutRef])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "?" || e.key === "Enter") {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    },
    []
  )

  useEffect(() => {
    return () => {
      clearTimeoutRef()
    }
  }, [clearTimeoutRef])

  const childElement = children as React.ReactElement
  const clonedChild = React.cloneElement(childElement, {
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter()
      childElement.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      childElement.props.onMouseLeave?.(e)
    },
    onTouchStart: (e: React.TouchEvent) => {
      handleTouchStart()
      childElement.props.onTouchStart?.(e)
    },
    onTouchEnd: (e: React.TouchEvent) => {
      handleTouchEnd()
      childElement.props.onTouchEnd?.(e)
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      handleKeyDown(e)
      childElement.props.onKeyDown?.(e)
    },
    tabIndex: 0,
    role: "button",
    "aria-describedby": `tooltip-${content.slice(0, 10).replace(/\s/g, "-")}`,
  })

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{clonedChild}</TooltipTrigger>
      <TooltipContent
        id={`tooltip-${content.slice(0, 10).replace(/\s/g, "-")}`}
        onPointerDownOutside={() => setOpen(false)}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

