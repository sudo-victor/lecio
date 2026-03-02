import SectionCard from "@/components/ui/SectionCard";
import { LessonPlan } from "@/types/plan";

interface PlanOutputProps {
  plan: LessonPlan;
}

const PlanOutput = ({ plan }: PlanOutputProps) => {
  return (
    <section className="flex flex-col gap-4">
      <SectionCard
        title="Fundamentação Teórica e BNCC"
        content={plan.foundation}
        defaultOpen
      />
      <SectionCard
        title="Domínio do Conteúdo"
        content={plan.teacherContext}
      />
      <SectionCard
        title="Tradução para o aluno"
        content={plan.studentExplanation}
      />
      <SectionCard
        title="Obstáculos de Aprendizagem"
        content={plan.commonMistakes}
      />
      <SectionCard title="Sequência Didática (50 min)" content={plan.lessonScript} />
      <SectionCard
        title="Instrumentos de Avaliação"
        content={plan.assessmentQuestions}
      />
    </section>
  );
};

export default PlanOutput;
