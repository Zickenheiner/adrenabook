import { cn } from '@/core/utils/cn';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export default function ProfessionalRegistrationStep({
  steps,
  currentStep,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div
            key={step.label}
            className="relative flex flex-1 flex-col items-center gap-1"
          >
            {/* Trait de liaison, du centre de ce cercle a celui du suivant.
                Positionne en absolu pour que le cercle reste centre sur sa
                colonne, et donc aligne avec son libelle. */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 h-0.5 w-full -translate-y-1/2 transition-all',
                  isCompleted ? 'bg-primary' : 'bg-muted',
                )}
                aria-hidden="true"
              />
            )}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                isCompleted &&
                  'border-primary bg-primary text-primary-foreground',
                isActive && 'border-primary bg-background text-primary',
                !isCompleted &&
                  !isActive &&
                  'border-muted-foreground/30 bg-background text-muted-foreground',
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div className="hidden flex-col items-center text-center sm:flex">
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
