import * as React from "react"
import { cn } from "../../lib/utils"

const Toaster = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-50 flex flex-col gap-2",
      className
    )}
    {...props}
  />
))
Toaster.displayName = "Toaster"

const Toast = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
      {
        "bg-background border": variant === "default",
        "bg-destructive text-destructive-foreground": variant === "destructive",
        "bg-green-500 text-white": variant === "success",
      },
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

export { Toaster, Toast }
