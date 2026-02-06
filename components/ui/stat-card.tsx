'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { type ReactNode } from 'react'

const gradientMap = {
  primary: {
    border: 'border-l-pine-teal',
    iconBg: 'bg-pine-teal/10',
    iconColor: 'text-pine-teal',
  },
  secondary: {
    border: 'border-l-hunter-green',
    iconBg: 'bg-hunter-green/10',
    iconColor: 'text-hunter-green',
  },
  success: {
    border: 'border-l-fern',
    iconBg: 'bg-fern/10',
    iconColor: 'text-fern',
  },
  purple: {
    border: 'border-l-pine-teal',
    iconBg: 'bg-pine-teal/10',
    iconColor: 'text-pine-teal',
  },
  pink: {
    border: 'border-l-gold',
    iconBg: 'bg-gold/10',
    iconColor: 'text-gold',
  },
  danger: {
    border: 'border-l-error',
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
  },
  gold: {
    border: 'border-l-gold',
    iconBg: 'bg-gold/10',
    iconColor: 'text-gold',
  },
} as const

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  gradient?: keyof typeof gradientMap
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function StatCard({ icon, label, value, gradient = 'primary', trend }: StatCardProps) {
  const colors = gradientMap[gradient] || gradientMap.primary

  return (
    <motion.div variants={fadeInUp}>
      <Card className={cn(
        'border border-light-grey bg-off-white border-l-4 transition-all duration-300',
        'hover:shadow-forest hover:scale-[1.02]',
        colors.border
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.iconBg, colors.iconColor)}>
              {icon}
            </div>

            {trend && (
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
          </div>

          <div>
            <p className="text-2xl font-semibold text-charcoal mb-0.5">
              {value}
            </p>
            <p className="text-sm text-medium-grey">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
