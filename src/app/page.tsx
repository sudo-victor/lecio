"use client";

import { useState } from "react";
import FeedbackBar from "@/components/lecio/FeedbackBar";
import Header from "@/components/lecio/Header";
import LoadingPanel from "@/components/lecio/LoadingPanel";
import PlanOutput from "@/components/lecio/PlanOutput";
import PrintPlanButton from "@/components/lecio/PrintPlanButton";
import TopicChip from "@/components/lecio/TopicChip";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import useGenerate from "@/hooks/useGenerate";

export default function Home() {
  const {
    state,
    topic,
    output,
    outputText,
    error,
    history,
    setTopic,
    generate,
    loadFromHistory,
    clearHistory,
    reset,
  } = useGenerate();
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "plans">("chat");

  const sendFeedback = async (useful: boolean) => {
    if (!outputText.trim()) return;

    try {
      setSendingFeedback(true);
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, output: outputText, useful }),
      });
      setFeedbackSent(true);
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
        <main className="flex-1 px-4 py-6">
          <nav className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <ul className="grid grid-cols-2 gap-1">
              <li>
                <button
                  aria-pressed={activeTab === "chat"}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "chat"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                  onClick={() => setActiveTab("chat")}
                  type="button"
                >
                  Lécio
                </button>
              </li>
              <li>
                <button
                  aria-pressed={activeTab === "plans"}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "plans"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                  onClick={() => setActiveTab("plans")}
                  type="button"
                >
                  Planos de Aula
                </button>
              </li>
            </ul>
          </nav>

          {activeTab === "chat" ? (
            <>
              {state === "idle" || state === "error" ? (
                <section className="flex h-full flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
                      Qual será a aula de hoje?
                    </h2>
                    <TextArea
                      label="Tema da aula"
                      maxLength={280}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="Descreva o tema, idade dos alunos e objetivos..."
                      value={topic}
                    />
                    {error ? (
                      <p className="text-sm font-medium text-red-600">{error}</p>
                    ) : null}
                  </div>

                  <div className="space-y-4 pb-2">
                    <p className="text-center text-sm font-light text-gray-300">
                      Prepare sua aula em menos de 5 minutos.
                    </p>
                    <Button
                      disabled={!topic.trim()}
                      onClick={() => {
                        setFeedbackSent(false);
                        void generate();
                      }}
                    >
                      Gerar Plano de Aula
                    </Button>
                  </div>
                </section>
              ) : null}

              {state === "loading" ? <LoadingPanel topic={topic} /> : null}

              {state === "result" ? (
                <section className="space-y-6 pb-32">
                  <div className="flex flex-col gap-4">
                    <TopicChip
                      onEdit={() => {
                        setFeedbackSent(false);
                        reset();
                      }}
                      topic={topic}
                    />
                  </div>
                  {output ? <PlanOutput plan={output} /> : null}

                  {output ? (
                    <PrintPlanButton
                      plan={output}
                      topic={topic}
                      fullWidth={true}
                      variant="outline"
                    />
                  ) : null}

                  <Button
                    variant="outline"
                    fullWidth={true}
                    onClick={() => {
                      setFeedbackSent(false);
                      reset();
                    }}
                  >
                    Gerar novo plano
                  </Button>
                </section>
              ) : null}
            </>
          ) : null}

          {activeTab === "plans" ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Planos salvos</h2>
                {history.length > 0 ? (
                  <button
                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    onClick={clearHistory}
                    type="button"
                  >
                    Limpar
                  </button>
                ) : null}
              </div>

              {history.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Nenhum plano salvo ainda. Gere um plano no chat para visualizar aqui.
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        className="min-w-0 flex-1 px-3 py-3 text-left hover:bg-slate-50"
                        onClick={() => {
                          setFeedbackSent(false);
                          loadFromHistory(item.id);
                          setActiveTab("chat");
                        }}
                        type="button"
                      >
                        <p className="truncate text-sm font-medium text-slate-800">{item.topic}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </button>
                      <PrintPlanButton
                        plan={item.plan}
                        topic={item.topic}
                        className="h-10 shrink-0 px-3"
                        fullWidth={false}
                        variant="ghost"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </main>

      </div>
      {activeTab === "chat" && state === "result" ? (
        <FeedbackBar
          disabled={sendingFeedback}
          onFeedback={sendFeedback}
          sent={feedbackSent}
        />
      ) : null}
    </div>
  );
}
