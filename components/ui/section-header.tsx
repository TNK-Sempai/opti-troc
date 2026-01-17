import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  className
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center',
        'shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3',
        iconBg
      )}>
        <Icon className={cn('w-7 h-7', iconColor)} />
      </div>
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
