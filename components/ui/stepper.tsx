import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  description: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    {
                      'bg-primary text-white': isCurrent,
                      'bg-success text-white': isCompleted,
                      'bg-neutral-200 text-neutral-500': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Text */}
                <div className="mt-2 text-center hidden md:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      {
                        'text-primary': isCurrent,
                        'text-neutral-900': isCompleted,
                        'text-neutral-500': isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-all',
                    {
                      'bg-success': isCompleted,
                      'bg-neutral-200': !isCompleted,
                    }
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}