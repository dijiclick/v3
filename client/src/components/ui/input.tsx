import * as React from "react"
import { useAdminLanguage } from "@/contexts/AdminLanguageContext"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, dir, ...props }, ref) => {
    // Only use AdminLanguageContext if we're in an admin context and no explicit dir is provided
    let contextDirection = null;
    try {
      const { isRTL } = useAdminLanguage();
      contextDirection = isRTL ? 'rtl' : 'ltr';
    } catch {
      // AdminLanguageContext not available (e.g., not in admin pages)
      contextDirection = null;
    }
    
    const inputDirection = dir || contextDirection || 'ltr';
    
    return (
      <input
        type={type}
        dir={inputDirection}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
