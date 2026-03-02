import type { LessonPlan, LessonPlanKey } from "@/types/plan";
import { LESSON_PLAN_KEYS } from "@/types/plan";

const SECTION_TITLES: Record<LessonPlanKey, string> = {
  foundation: "Fundamentacao Academica",
  teacherContext: "Contexto Rapido para o Professor",
  studentExplanation: "Como Explicar para a Turma",
  commonMistakes: "Pontos de Confusao Comuns",
  lessonScript: "Roteiro de Aula (50 min)",
  assessmentQuestions: "Perguntas Avaliativas",
};

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function markdownToPlainText(text: string): string {
  let result = text;

  // Blocos de código: extrair apenas o texto interno
  result = result.replace(/```[\s\S]*?```/g, (match) =>
    match.slice(3, -3).trim().replace(/\n/g, " "),
  );

  // Código inline `texto`
  result = result.replace(/`([^`]+)`/g, "$1");

  // Links [texto](url) → texto
  result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // Negrito/itálico: **texto** __texto__ *texto* _texto_
  result = result.replace(/\*\*([^*]+)\*\*/g, "$1");
  result = result.replace(/__([^_]+)__/g, "$1");
  result = result.replace(/\*([^*]+)\*/g, "$1");
  result = result.replace(/_([^_]+)_/g, "$1");

  // Cabeçalhos: # Título → Título
  result = result.replace(/^#{1,6}\s+/gm, "");

  // Citações: > texto → texto
  result = result.replace(/^>\s*/gm, "");

  // Listas com marcador: - item ou * item → • item
  result = result.replace(/^[\-\*]\s+/gm, "• ");

  return result.trim();
}

function buildPrintDocument(plan: LessonPlan, topic: string): string {
  const sectionsHtml = LESSON_PLAN_KEYS.map(
    (key) => `
    <section style="margin-bottom: 1.5rem; break-inside: avoid;">
      <h2 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 2px solid #22c55e;">
        ${escapeHtml(SECTION_TITLES[key])}
      </h2>
      <div style="font-size: 0.875rem; line-height: 1.5; color: #334155; white-space: pre-wrap;">
        ${escapeHtml(markdownToPlainText(plan[key] || "Sem conteudo gerado para esta secao."))}
      </div>
    </section>
  `,
  ).join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plano de Aula - ${escapeHtml(topic)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 1.5rem; max-width: 42rem; margin: 0 auto; color: #1e293b; }
    h1 { font-size: 1.25rem; font-weight: 700; color: #22c55e; margin-bottom: 1.5rem; }
    .topic { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 9999px; padding: 0.5rem 1rem; display: inline-block; margin-bottom: 1.5rem; font-size: 0.875rem; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Plano de Aula</h1>
  <div class="topic">${escapeHtml(topic)}</div>
  ${sectionsHtml}
</body>
</html>
  `.trim();
}

export function printPlan(plan: LessonPlan, topic: string): void {
  const html = buildPrintDocument(plan, topic);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  printWindow.onafterprint = () => printWindow.close();
  printWindow.addEventListener("load", () => printWindow.print());
}
