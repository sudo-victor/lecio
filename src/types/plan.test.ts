import { describe, expect, it } from "vitest";
import { lessonPlanToMarkdown, parseLessonPlanJson, validateLessonPlan } from "@/types/plan";

describe("plan schema", () => {
  const validPlan = {
    foundation: "Base conceitual",
    teacherContext: "Contexto docente",
    studentExplanation: "Explicacao para turma",
    commonMistakes: "Erros comuns",
    lessonScript: "Roteiro da aula",
    assessmentQuestions: "Perguntas de avaliacao",
  };

  it("valida payload completo com strings nao vazias", () => {
    const result = validateLessonPlan(validPlan);
    expect(result).toEqual(validPlan);
  });

  it("rejeita payload com campos vazios", () => {
    const result = validateLessonPlan({
      ...validPlan,
      lessonScript: "   ",
    });

    expect(result).toBeNull();
  });

  it("faz parse de JSON puro e fenced JSON", () => {
    const rawJson = JSON.stringify(validPlan);
    const fencedJson = `\`\`\`json\n${rawJson}\n\`\`\``;

    expect(parseLessonPlanJson(rawJson)).toEqual(validPlan);
    expect(parseLessonPlanJson(fencedJson)).toEqual(validPlan);
  });

  it("gera markdown com seis secoes ordenadas", () => {
    const markdown = lessonPlanToMarkdown(validPlan);

    expect(markdown).toContain("## 1. Fundamentacao Academica");
    expect(markdown).toContain("## 6. Perguntas Avaliativas");
  });
});
