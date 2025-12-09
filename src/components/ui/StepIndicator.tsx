import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'relative flex items-center',
              index !== steps.length - 1 && 'flex-1'
            )}
          >
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'step-indicator',
                  step.id < currentStep && 'completed',
                  step.id === currentStep && 'active',
                  step.id > currentStep && 'pending'
                )}
                aria-current={step.id === currentStep ? 'step' : undefined}
              >
                {step.id < currentStep ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  step.id === currentStep
                    ? 'text-primary'
                    : step.id < currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector line */}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-0.5 flex-1',
                  step.id < currentStep ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
