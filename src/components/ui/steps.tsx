import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "border-primary"
                  : "border-muted-foreground/25"
              )}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            <div className="ml-4">
              <div
                className={cn(
                  "text-sm font-medium",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "ml-4 h-0.5 w-16",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/25"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 