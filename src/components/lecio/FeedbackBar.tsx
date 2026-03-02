import Button from "@/components/ui/Button";

interface FeedbackBarProps {
  onFeedback: (useful: boolean) => Promise<void>;
  disabled?: boolean;
  sent?: boolean;
}

const FeedbackBar = ({ onFeedback, disabled = false, sent = false }: FeedbackBarProps) => {
  return (
    <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4">
      <div className="mx-auto flex w-full max-w-sm items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-gray-800">Isso foi util?</p>
          <p className="text-xs text-slate-500">Sua avaliacao melhora o Lecio.</p>
        </div>
        {sent ? (
          <span className="rounded-full bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600">
            Obrigado!
          </span>
        ) : (
          <div className="flex gap-2">
            <Button
              aria-label="Plano util"
              disabled={disabled}
              fullWidth={false}
              onClick={() => void onFeedback(true)}
              variant="outline"
            >
              👍
            </Button>
            <Button
              aria-label="Plano nao util"
              disabled={disabled}
              fullWidth={false}
              onClick={() => void onFeedback(false)}
              variant="outline"
            >
              👎
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackBar;
