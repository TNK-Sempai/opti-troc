'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import type { TargetAndTransition } from 'framer-motion'

const gradientStyles = {
  primary: 'bg-pine-teal hover:bg-hunter-green text-white',
  secondary: 'bg-hunter-green hover:bg-pine-teal text-white',
  success: 'bg-fern hover:bg-hunter-green text-white',
  danger: 'bg-error hover:bg-error/90 text-white',
  gold: 'bg-gold hover:bg-gold-hover text-charcoal',
} as const

interface PremiumButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  icon?: LucideIcon
  gradient?: keyof typeof gradientStyles
  glow?: boolean
}

export function PremiumButton({
  children,
  icon: Icon,
  gradient = 'gold',
  glow = false,
  className,
  asChild,
  ...props
}: PremiumButtonProps) {
  const gradientClass = gradientStyles[gradient] || gradientStyles.gold

  const baseClasses = cn(
    'relative font-semibold border-0 transition-all duration-200',
    gradientClass,
    glow && 'shadow-gold-glow',
    className
  )

  if (asChild) {
    return (
      <Button
        asChild
        className={baseClasses}
        {...props}
      >
        {children}
      </Button>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 } satisfies TargetAndTransition}
      whileTap={{ scale: 0.97 } satisfies TargetAndTransition}
      className="inline-flex"
    >
      <Button
        className={baseClasses}
        {...props}
      >
        <span className="relative flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </span>
      </Button>
    </motion.div>
  )
}
