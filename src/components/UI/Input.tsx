import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

const campoBase =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-[0.9375rem] leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-[#80868b]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(campoBase, className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(campoBase, "min-h-[200px] resize-none", className)}
      {...props}
    />
  );
});

interface CampoProps {
  label?: React.ReactNode;
  erro?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/** Agrupa label + controle + mensagem de erro (substitui `.form-group`). */
export function Campo({ label, erro, htmlFor, children, className }: Readonly<CampoProps>) {
  return (
    <div className={cn("mb-6", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      {children}
      {erro && <p className="mt-1 text-sm text-error">{erro}</p>}
    </div>
  );
}
