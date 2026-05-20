"use client";

import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
    outline: "bg-transparent border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white",
    ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white border-transparent",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={isLoading || disabled}
      className={`
        flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold 
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center"
          >
            <svg 
              className="animate-spin h-5 w-5 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {leftIcon && <span className="text-lg">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="text-lg">{rightIcon}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
