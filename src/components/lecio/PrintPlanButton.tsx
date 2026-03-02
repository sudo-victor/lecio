import type { LessonPlan } from "@/types/plan";
import { printPlan } from "@/lib/printPlan";
import Button from "@/components/ui/Button";

interface PrintPlanButtonProps {
  plan: LessonPlan;
  topic: string;
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
  className?: string;
}

const PrintPlanButton = ({
  plan,
  topic,
  variant = "outline",
  fullWidth = true,
  className = "",
}: PrintPlanButtonProps) => {
  return (
    <Button
      aria-label="Imprimir plano"
      className={className}
      fullWidth={fullWidth}
      type="button"
      variant={variant}
      onClick={() => printPlan(plan, topic)}
    >
      🖨️ Imprimir
    </Button>
  );
};

export default PrintPlanButton;
