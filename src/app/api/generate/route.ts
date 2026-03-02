import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { MAX_TOKENS, MODEL, SYSTEM_PROMPT } from "@/lib/claude";
import { lessonPlanSchema } from "@/lib/lessonPlanSchema";
import { LessonPlan } from "@/types/plan";

const MAX_TOPIC_SIZE = 280;

function createMockOutput(topic: string): LessonPlan {
  return {
    foundation: `O tema **"${topic}"** pode ser abordado com base em:

- Conceitos centrais e exemplos aplicados ao cotidiano escolar
- Referencias a BNCC quando pertinente
- Linguagem acessivel ao nivel da turma`,
    teacherContext: `Apresente o contexto em linguagem simples:

- **Contexto historico e social** do tema
- Conexao com o repertorio da turma
- Pontos de atencao para mediação`,
    studentExplanation: `Use estrategias didaticas como:

1. **Analogias** e exemplos do dia a dia
2. Perguntas disparadoras
3. Um exemplo pratico para facilitar a compreensao`,
    commonMistakes: `Antecipe confusoes comuns:

- Termos tecnicos que geram duvida
- Comparacao com conceitos proximos
- Erros frequentes em provas e atividades`,
    lessonScript: `**Roteiro sugerido (50 min):**

1. **10 min** - Introducao e motivacao
2. **20 min** - Explicacao guiada
3. **10 min** - Atividade curta
4. **10 min** - Fechamento e retomada`,
    assessmentQuestions: `**Perguntas para avaliacao:**

- 3 perguntas objetivas
- 2 perguntas abertas
- Validar compreensao e capacidade de argumentacao`,
  };
}

function buildRepairPrompt(topic: string): string {
  return [
    `Tema: ${topic}`,
    "",
    "Retorne SOMENTE o objeto JSON, sem blocos de codigo (```) ou texto extra.",
    "Cada campo deve ser string valida. Evite aspas duplas dentro dos textos; use apostrofos ou parenteses para citar termos.",
  ].join("\n");
}

async function runStructuredParse(client: Anthropic, topic: string): Promise<LessonPlan | null> {
  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: topic }],
    output_config: {
      format: zodOutputFormat(lessonPlanSchema),
    },
  });

  if (!message.parsed_output) {
    return null;
  }

  return message.parsed_output;
}

async function generatePlanWithRetry(client: Anthropic, topic: string): Promise<LessonPlan | null> {
  try {
    const parsedFirst = await runStructuredParse(client, topic);
    if (parsedFirst) {
      console.log("[generate] parse_ok attempt=1");
      return parsedFirst;
    }
    console.warn("[generate] parse_failed attempt=1 retry=true");
  } catch {
    console.warn("[generate] parse_failed attempt=1 retry=true");
  }

  try {
    const parsedSecond = await runStructuredParse(client, buildRepairPrompt(topic));
    if (parsedSecond) {
      console.log("[generate] parse_ok attempt=2");
      return parsedSecond;
    }
    console.warn("[generate] parse_failed attempt=2 retry=false status=422");
  } catch {
    console.warn("[generate] parse_failed attempt=2 retry=false status=422");
  }

  return null;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { topic?: string };
    const topic = body.topic?.trim() ?? "";

    if (!topic) {
      return Response.json({ error: "Campo topic obrigatorio." }, { status: 400 });
    }

    if (topic.length > MAX_TOPIC_SIZE) {
      return Response.json(
        { error: "Campo topic deve ter no maximo 280 caracteres." },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ plan: createMockOutput(topic), source: "mock" });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const plan = await generatePlanWithRetry(client, topic);

    if (!plan) {
      return Response.json(
        {
          error:
            "Nao foi possivel gerar um plano em formato valido. Tente novamente com um tema mais especifico.",
        },
        { status: 422 },
      );
    }

    return Response.json({ plan, source: "model" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.log(message);
    return Response.json(
      { error: "Falha ao gerar plano de aula. Tente novamente." },
      { status: 500 },
    );
  }
}
