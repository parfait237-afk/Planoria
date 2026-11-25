import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export function Button({ variant = "secondary", children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode }) {
  const variants: Record<ButtonVariant, string> = { primary: "border-transparent bg-[#059e79] text-white hover:bg-[#078363]", secondary: "border-[#dfe5e9] bg-white text-[#142d4e] hover:bg-[#f5f7f8]", ghost: "border-transparent bg-transparent text-[#536477] hover:bg-[#f3f6f7]" };
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}>{children}</button>;
}
