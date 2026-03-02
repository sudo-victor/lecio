import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextArea = ({ label, className = "", ...props }: TextAreaProps) => {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="px-1 text-base font-medium text-slate-900">{label}</span>
      <textarea
        className={`min-h-40 w-full resize-none rounded-3xl border border-slate-100 bg-slate-50 p-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none ${className}`.trim()}
        {...props}
      />
    </label>
  );
};

export default TextArea;
