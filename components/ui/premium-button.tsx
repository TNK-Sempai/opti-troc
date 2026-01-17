'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PremiumButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  icon?: LucideIcon
  gradient?: 'primary' | 'secondary' | 'success' | 'danger'
  glow?: boolean
}

const gradientClasses = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0',
  secondary: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white border-0',
  success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white border-0',
  danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0',
}

const glowClasses = {
  primary: 'hover:shadow-glow-primary',
  secondary: 'hover:shadow-glow-secondary',
  success: 'hover:shadow-xl hover:shadow-emerald-500/30',
  danger: 'hover:shadow-xl hover:shadow-red-500/30',
}

export function PremiumButton({
  children,
  icon: Icon,
  gradient = 'primary',
  glow = false,
  className,
  ...props
}: PremiumButtonProps) {
  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-300 font-semibold',
        'hover:scale-105 hover:-translate-y-0.5',
        gradient && gradientClasses[gradient],
        glow && glowClasses[gradient],
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <span className="relative flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
    </Button>
  )
}
