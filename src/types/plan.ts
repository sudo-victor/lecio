export const PLAN_SECTIONS = [
  "Fundamentacao Academica",
  "Contexto Rapido para o Professor",
  "Como Explicar para a Turma",
  "Pontos de Confusao Comuns",
  "Roteiro de Aula (50 min)",
  "Perguntas Avaliativas",
] as const;

export const LESSON_PLAN_KEYS = [
  "foundation",
  "teacherContext",
  "studentExplanation",
  "commonMistakes",
  "lessonScript",
  "assessmentQuestions",
] as const;

export interface LessonPlan {
  foundation: string;
  teacherContext: string;
  studentExplanation: string;
  commonMistakes: string;
  lessonScript: string;
  assessmentQuestions: string;
}

export type LessonPlanKey = keyof LessonPlan;

const SECTION_KEY_MAP: Record<(typeof PLAN_SECTIONS)[number], LessonPlanKey> = {
  "Fundamentacao Academica": "foundation",
  "Contexto Rapido para o Professor": "teacherContext",
  "Como Explicar para a Turma": "studentExplanation",
  "Pontos de Confusao Comuns": "commonMistakes",
  "Roteiro de Aula (50 min)": "lessonScript",
  "Perguntas Avaliativas": "assessmentQuestions",
};

const KEY_TITLE_MAP: Record<LessonPlanKey, (typeof PLAN_SECTIONS)[number]> = {
  foundation: "Fundamentacao Academica",
  teacherContext: "Contexto Rapido para o Professor",
  studentExplanation: "Como Explicar para a Turma",
  commonMistakes: "Pontos de Confusao Comuns",
  lessonScript: "Roteiro de Aula (50 min)",
  assessmentQuestions: "Perguntas Avaliativas",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSectionValue(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function validateLessonPlan(value: unknown): LessonPlan | null {
  if (!isRecord(value)) return null;

  const normalized = {
    foundation: normalizeSectionValue(value.foundation),
    teacherContext: normalizeSectionValue(value.teacherContext),
    studentExplanation: normalizeSectionValue(value.studentExplanation),
    commonMistakes: normalizeSectionValue(value.commonMistakes),
    lessonScript: normalizeSectionValue(value.lessonScript),
    assessmentQuestions: normalizeSectionValue(value.assessmentQuestions),
  } satisfies LessonPlan;

  if (!hasFullPlan(normalized)) return null;

  return normalized;
}

function tryParseJson(raw: string): unknown {
  return JSON.parse(raw);
}

function extractJsonCandidate(raw: string): string {
  const trimmed = raw.trim();

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

export function parseLessonPlanJson(raw: string): LessonPlan | null {
  const candidate = extractJsonCandidate(raw);

  try {
    return validateLessonPlan(tryParseJson(candidate));
  } catch {
    return null;
  }
}

export function lessonPlanToMarkdown(plan: LessonPlan): string {
  return LESSON_PLAN_KEYS.map((key, index) => {
    return `## ${index + 1}. ${KEY_TITLE_MAP[key]}\n${plan[key]}`;
  }).join("\n\n");
}

function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[#\d\.\-\s]+/, "")
    .trim();
}

export function parsePlanSections(raw: string): LessonPlan {
  const lines = raw.split("\n");
  const result: LessonPlan = {
    foundation: "",
    teacherContext: "",
    studentExplanation: "",
    commonMistakes: "",
    lessonScript: "",
    assessmentQuestions: "",
  };

  let currentKey: LessonPlanKey | null = null;

  for (const line of lines) {
    if (line.trim().startsWith("##")) {
      const normalized = normalizeTitle(line.replace(/^##+/, ""));
      const section = PLAN_SECTIONS.find((name) => normalized.startsWith(name));
      currentKey = section ? SECTION_KEY_MAP[section] : null;
      continue;
    }

    if (currentKey) {
      result[currentKey] = `${result[currentKey]}${line}\n`.trim();
    }
  }

  return result;
}

export function hasFullPlan(plan: LessonPlan): boolean {
  return Object.values(plan).every((section) => section.trim().length > 0);
}
