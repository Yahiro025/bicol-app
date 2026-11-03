import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses = {
  primary: "bg-[var(--editorial-accent)] hover:bg-[var(--editorial-accent-dim)] text-[#FFFDF9] dark:text-[#0E0D0B] shadow-md",
  secondary: "bg-[var(--editorial-surface)] hover:bg-[var(--editorial-surface-raised)] text-[var(--editorial-text)] border border-[var(--editorial-border)] hover:border-[var(--editorial-accent)]",
  outline: "bg-transparent border border-[var(--editorial-border)] hover:border-[var(--editorial-accent)] text-[var(--editorial-text-secondary)] hover:text-[var(--editorial-text)]",
  ghost: "bg-transparent hover:bg-[var(--editorial-surface)] text-[var(--editorial-muted)] hover:text-[var(--editorial-text)] border border-transparent",
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
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)]",
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
