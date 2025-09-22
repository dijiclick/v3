/* @refresh reload */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transform",
        destructive:
          "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transform",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transform",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transform",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] transform",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.02] active:scale-[0.98] transform",
        gradient: "bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.98] transform relative overflow-hidden",
        modern: "bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transform",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:bg-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transform",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-[52px] rounded-xl px-10 py-3 text-base",
        xl: "h-16 rounded-2xl px-12 py-4 text-lg",
        icon: "h-11 w-11",
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
