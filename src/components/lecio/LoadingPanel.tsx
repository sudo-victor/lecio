import { useEffect, useState } from "react";

interface LoadingPanelProps {
  topic: string;
}

const LOADING_MESSAGES = [
  "Gerando seu plano de aula com carinho pedagógico...",
  "Organizando os objetivos da aula para você.",
  "Conectando o tema aos resultados de aprendizagem.",
  "Estruturando a abertura para engajar a turma.",
  "Refinando explicações para linguagem da sala.",
  "Montando exemplos práticos para facilitar a compreensão.",
  "Sugerindo estratégias para manter o foco dos alunos.",
  "Preparando um roteiro claro para os 50 minutos.",
  "Balanceando teoria e prática no plano.",
  "Pensando em perguntas que ativem participação.",
  "Incluindo momentos de verificação da aprendizagem.",
  "Ajustando o nível de profundidade do conteúdo.",
  "Antecipando dúvidas comuns da turma.",
  "Reforcando conexões com competências essenciais.",
  "Organizando uma sequência didática objetiva.",
  "Planejando intervenções para apoiar diferentes ritmos.",
  "Preparando fechamento com retomada dos pontos-chave.",
  "Estruturando avaliação formativa da aula.",
  "Revisando consistência pedagógica do plano.",
  "Finalizando os últimos detalhes para você.",
] as const;

const LoadingPanel = ({ topic }: LoadingPanelProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % LOADING_MESSAGES.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">
          Gerando seu plano...
        </h2>
        <p className="mt-2 text-base text-slate-500">
          Isso levará apenas alguns segundos.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="px-1 text-base font-medium text-slate-900">Tema da aula</p>
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-slate-500">
          {topic}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex min-h-12 items-start gap-2 text-sm font-medium leading-snug text-slate-900">
          <span className="mt-1 shrink-0 inline-flex size-2 animate-pulse rounded-full bg-green-500" />
          {LOADING_MESSAGES[messageIndex]}
        </div>
        <p className="mt-3 text-xs text-slate-500">As mensagens se atualizam automaticamente.</p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
      </div>
    </section>
  );
};

export default LoadingPanel;
