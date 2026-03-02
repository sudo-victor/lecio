import { beforeEach, describe, expect, it, vi } from "vitest";

const parseMessageMock = vi.hoisted(() => vi.fn());

vi.mock("@anthropic-ai/sdk", () => {
  class AnthropicMock {
    messages = {
      parse: parseMessageMock,
    };
  }

  return {
    default: AnthropicMock,
  };
});

import { POST } from "@/app/api/generate/route";

function buildRequest(topic: string): Request {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
}

const validPlan = {
  foundation: "Base conceitual",
  teacherContext: "Contexto docente",
  studentExplanation: "Explicacao para turma",
  commonMistakes: "Erros comuns",
  lessonScript: "Roteiro da aula",
  assessmentQuestions: "Perguntas de avaliacao",
};

describe("POST /api/generate", () => {
  beforeEach(() => {
    parseMessageMock.mockReset();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("retorna mock estruturado quando API key nao existe", async () => {
    const response = await POST(buildRequest("revolucao industrial"));
    const body = (await response.json()) as { plan?: unknown; source?: string };

    expect(response.status).toBe(200);
    expect(body.source).toBe("mock");
    expect(body.plan).toBeTruthy();
  });

  it("retorna plano do modelo sem retry quando JSON e valido", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    parseMessageMock.mockResolvedValueOnce({ parsed_output: validPlan });

    const response = await POST(buildRequest("fotossintese"));
    const body = (await response.json()) as { plan?: unknown; source?: string };

    expect(response.status).toBe(200);
    expect(body.source).toBe("model");
    expect(body.plan).toEqual(validPlan);
    expect(parseMessageMock).toHaveBeenCalledTimes(1);
  });

  it("aplica retry quando primeira resposta nao segue schema", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    parseMessageMock
      .mockRejectedValueOnce(new Error("invalid output"))
      .mockResolvedValueOnce({ parsed_output: validPlan });

    const response = await POST(buildRequest("primeira guerra mundial"));

    expect(response.status).toBe(200);
    expect(parseMessageMock).toHaveBeenCalledTimes(2);
  });

  it("retorna 422 quando falha em duas tentativas de formato", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    parseMessageMock
      .mockRejectedValueOnce(new Error("invalid output"))
      .mockRejectedValueOnce(new Error("invalid output"));

    const response = await POST(buildRequest("mitose"));
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(422);
    expect(body.error).toContain("formato valido");
    expect(parseMessageMock).toHaveBeenCalledTimes(2);
  });
});
