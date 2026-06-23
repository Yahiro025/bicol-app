import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
  outline: "bg-transparent border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white",
  ghost: "bg-transparent hover:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold min-w-11 min-h-11",
        "transition-all duration-200 active:scale-95 hover:scale-[1.02]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        "touch-manipulation [-webkit-tap-highlight-color:transparent]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" /> : children}
    </button>
  )
);

Button.displayName = "Button";

export default Button;
