import { z } from "zod";
import type { LessonPlan } from "@/types/plan";

const nonEmptyText = z.string().trim().min(1);

export const lessonPlanSchema: z.ZodType<LessonPlan> = z.object({
  foundation: nonEmptyText,
  teacherContext: nonEmptyText,
  studentExplanation: nonEmptyText,
  commonMistakes: nonEmptyText,
  lessonScript: nonEmptyText,
  assessmentQuestions: nonEmptyText,
});
