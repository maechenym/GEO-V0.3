import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
        destructive: "bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]",
        outline: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100",
        secondary: "bg-ink-100 text-ink-700 hover:bg-ink-200 active:bg-ink-300",
        ghost: "text-ink-600 hover:bg-ink-50 hover:text-ink-900 active:bg-ink-100",
        link: "text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px] sm:min-h-0",
        sm: "h-9 rounded-lg px-3 text-xs min-h-[44px] sm:min-h-0",
        lg: "h-11 px-8 rounded-lg min-h-[44px] sm:min-h-0",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

