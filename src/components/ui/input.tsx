"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Search, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-ring",
        error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
        success: "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
        warning: "border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/20",
      },
      inputSize: {
        default: "h-10",
        sm: "h-8 px-2 text-xs",
        lg: "h-12 px-4 text-base",
        xl: "h-14 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant, 
    inputSize,
    leftIcon,
    rightIcon,
    error,
    success,
    loading,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // Determine variant based on error/success states
    const inputVariant = error ? "error" : success ? "success" : variant

    // Handle password visibility toggle
    const handlePasswordToggle = () => {
      setShowPassword(!showPassword)
    }

    // Get input type
    const inputType = type === "password" && showPassword ? "text" : type

    // Get right icon based on type and state
    const getRightIcon = () => {
      if (loading) {
        return <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      }
      if (error) {
        return <AlertCircle className="w-4 h-4 text-red-500" />
      }
      if (success) {
        return <CheckCircle className="w-4 h-4 text-green-500" />
      }
      if (type === "password") {
        return (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )
      }
      return rightIcon
    }

    return (
      <div className="relative">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize, className }),
              leftIcon && "pl-10",
              (getRightIcon() || rightIcon) && "pr-10"
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {(getRightIcon() || rightIcon) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getRightIcon()}
            </div>
          )}
        </div>
        
        {/* Error/Success Message */}
        {(error || success) && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-red-600" : "text-green-600"
          )}>
            {error || success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'type'> {
  onSearch?: (value: string) => void
  placeholder?: string
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, placeholder = "Search...", className, ...props }, ref) => {
    const [searchValue, setSearchValue] = useState("")

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      onSearch?.(searchValue)
    }

    return (
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          leftIcon={<Search className="w-4 h-4" />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-md px-3 py-1 text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { Input, SearchInput, inputVariants }
