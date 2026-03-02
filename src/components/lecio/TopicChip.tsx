interface TopicChipProps {
  topic: string;
  onEdit: () => void;
}

const TopicChip = ({ topic, onEdit }: TopicChipProps) => {
  return (
    <div className="flex justify-center">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-gray-800"
        onClick={onEdit}
        type="button"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-green-500">
          Topico:
        </span>
        <span className="max-w-56 truncate font-medium">{topic}</span>
        <span aria-hidden>✎</span>
      </button>
    </div>
  );
};

export default TopicChip;
