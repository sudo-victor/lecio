import SectionCard from "@/components/ui/SectionCard";
import { LessonPlan } from "@/types/plan";

interface PlanOutputProps {
  plan: LessonPlan;
}

const PlanOutput = ({ plan }: PlanOutputProps) => {
  return (
    <section className="flex flex-col gap-4">
      <SectionCard
        title="Fundamentação Acadêmica"
        content={plan.foundation}
        defaultOpen
      />
      <SectionCard
        title="Contexto Rápido para o Professor"
        content={plan.teacherContext}
      />
      <SectionCard
        title="Como Explicar para a Turma"
        content={plan.studentExplanation}
      />
      <SectionCard
        title="Pontos de Confusão Comuns"
        content={plan.commonMistakes}
      />
      <SectionCard title="Roteiro de Aula (50 minutos)" content={plan.lessonScript} />
      <SectionCard
        title="Perguntas Avaliativas"
        content={plan.assessmentQuestions}
      />
    </section>
  );
};

export default PlanOutput;
