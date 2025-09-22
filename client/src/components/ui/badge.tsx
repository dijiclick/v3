/* @refresh reload */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 transform",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-sm hover:shadow-md hover:scale-105 transform",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-md hover:shadow-lg hover:scale-105 transform",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:scale-105 transform",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg hover:scale-105 transform",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-105 transform",
        info:
          "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg hover:scale-105 transform",
        gradient:
          "border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transform",
        modern:
          "border-transparent bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-100 text-white dark:text-slate-900 shadow-lg hover:shadow-xl hover:scale-105 transform",
        glass:
          "bg-white/20 backdrop-blur-sm border-white/30 text-foreground shadow-lg hover:bg-white/30 hover:scale-105 transform",
        pulse:
          "border-transparent bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 transform animate-pulse",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-1.5 text-sm",
        xl: "px-5 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
