import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
}

const Button = ({
  className = "",
  variant = "primary",
  fullWidth = true,
  ...props
}: ButtonProps) => {
  const baseClass =
    "inline-flex h-14 items-center justify-center rounded-xl px-5 text-base font-semibold transition disabled:cursor-not-allowed";
  const widthClass = fullWidth ? "w-full" : "";

  const variantClass =
    variant === "primary"
      ? "bg-green-500 text-white shadow-[0_10px_15px_-3px_rgba(51,204,153,0.2)] hover:bg-green-600 disabled:bg-green-500/60"
      : variant === "outline"
        ? "border border-gray-100 bg-white text-gray-800 hover:bg-gray-50 disabled:text-gray-300"
        : "bg-transparent text-slate-500 hover:bg-slate-50 disabled:text-gray-300";

  return (
    <button
      className={`${baseClass} ${widthClass} ${variantClass} ${className}`.trim()}
      {...props}
    />
  );
};

export default Button;
