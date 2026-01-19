import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  gradient?: 'primary' | 'secondary' | 'success' | 'purple' | 'pink' | 'danger'
  trend?: {
    value: string
    isPositive: boolean
  }
}

const gradientClasses = {
  primary: 'from-blue-500 to-blue-600',
  secondary: 'from-orange-500 to-orange-600',
  success: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  danger: 'from-red-500 to-red-600',
}

export function StatCard({ icon: Icon, label, value, gradient = 'primary', trend }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-neutral-200/60">
      {/* Gradient background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500',
        gradientClasses[gradient]
      )} />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300',
            gradientClasses[gradient]
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {trend && (
            <span className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </span>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent mb-1">
            {value}
          </p>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
