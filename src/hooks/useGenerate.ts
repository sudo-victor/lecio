"use client";

import { useEffect, useState } from "react";
import { lessonPlanToMarkdown, LessonPlan, validateLessonPlan } from "@/types/plan";

type GenerateState = "idle" | "loading" | "result" | "error";

interface UseGenerateReturn {
  state: GenerateState;
  topic: string;
  output: LessonPlan | null;
  outputText: string;
  error: string;
  history: HistoryPlan[];
  setTopic: (topic: string) => void;
  generate: () => Promise<void>;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

const MAX_TOPIC_SIZE = 280;
const HISTORY_STORAGE_KEY = "lecio:plans-history";
const MAX_HISTORY_ITEMS = 10;

export interface HistoryPlan {
  id: string;
  topic: string;
  plan: LessonPlan;
  createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseHistory(raw: string | null): HistoryPlan[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): HistoryPlan | null => {
        if (!isRecord(item)) return null;
        const topic = typeof item.topic === "string" ? item.topic.trim() : "";
        const id = typeof item.id === "string" ? item.id : "";
        const createdAt = typeof item.createdAt === "string" ? item.createdAt : "";
        const plan = validateLessonPlan(item.plan);

        if (!topic || !id || !createdAt || !plan) return null;

        return { id, topic, createdAt, plan };
      })
      .filter((item): item is HistoryPlan => item !== null);
  } catch {
    return [];
  }
}

const useGenerate = (): UseGenerateReturn => {
  const [state, setState] = useState<GenerateState>("idle");
  const [topic, setTopicState] = useState("");
  const [output, setOutput] = useState<LessonPlan | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryPlan[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    setHistory(parseHistory(stored));
  }, []);

  const persistHistory = (updater: (current: HistoryPlan[]) => HistoryPlan[]) => {
    setHistory((current) => {
      const nextHistory = updater(current);
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const setTopic = (nextTopic: string) => {
    setTopicState(nextTopic);

    if (state === "error") {
      setState("idle");
      setError("");
    }
  };

  const generate = async () => {
    const normalizedTopic = topic.trim();

    if (!normalizedTopic) {
      setState("error");
      setError("Informe um tema para gerar o plano.");
      return;
    }

    if (normalizedTopic.length > MAX_TOPIC_SIZE) {
      setState("error");
      setError("O tema deve ter no maximo 280 caracteres.");
      return;
    }

    setState("loading");
    setOutput(null);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: normalizedTopic }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Falha ao gerar plano de aula.");
      }

      const payload = (await response.json()) as { plan?: LessonPlan; error?: string };

      if (!payload.plan) {
        throw new Error(payload.error ?? "Resposta invalida do servidor.");
      }

      setOutput(payload.plan);
      const newEntry: HistoryPlan = {
        id: crypto.randomUUID(),
        topic: normalizedTopic,
        plan: payload.plan,
        createdAt: new Date().toISOString(),
      };
      persistHistory((current) => [newEntry, ...current].slice(0, MAX_HISTORY_ITEMS));

      setState("result");
    } catch (requestError) {
      setState("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao gerar o plano.",
      );
    }
  };

  const reset = () => {
    setState("idle");
    setOutput(null);
    setError("");
  };

  const loadFromHistory = (id: string) => {
    const selected = history.find((entry) => entry.id === id);
    if (!selected) return;

    setTopicState(selected.topic);
    setOutput(selected.plan);
    setError("");
    setState("result");
  };

  const clearHistory = () => {
    persistHistory(() => []);
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  return {
    state,
    topic,
    output,
    outputText: output ? lessonPlanToMarkdown(output) : "",
    error,
    history,
    setTopic,
    generate,
    loadFromHistory,
    clearHistory,
    reset,
  };
};

export default useGenerate;
