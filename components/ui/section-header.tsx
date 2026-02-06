'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  iconColor?: string
  iconBg?: string
  className?: string
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconColor = 'text-pine-teal',
  iconBg = 'bg-pine-teal/10',
  className
}: SectionHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn('flex items-center gap-3', className)}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        iconBg
      )}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div>
        <h2 className="font-serif text-2xl text-pine-teal">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-medium-grey mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}
