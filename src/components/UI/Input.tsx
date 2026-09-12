"use client";

import Button from "@/components/UI/Button";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

const campoBase =
  "w-full rounded-md border border-gray-300 bg-white px-3 text-[0.9375rem] leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-[14px] placeholder:text-[#80868b] disabled:opacity-60 disabled:cursor-not-allowed";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(campoBase, "h-9 py-0", className)} {...props} />;
  },
);

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mostrarSenha?: boolean;
  onToggleMostrarSenha?: () => void;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      mostrarSenha: propMostrarSenha,
      onToggleMostrarSenha,
      disabled,
      ...props
    },
    ref,
  ) {
    const [visivelInterno, setVisivelInterno] = useState(false);

    const estaVisivel = propMostrarSenha !== undefined ? propMostrarSenha : visivelInterno;

    const alternarVisibilidade = () => {
      if (disabled) return;
      if (onToggleMostrarSenha) {
        onToggleMostrarSenha();
      } else {
        setVisivelInterno((prev) => !prev);
      }
    };

    return (
      <div
        className={cn(
          "relative flex h-9 w-full items-center rounded-md border border-gray-300 bg-white transition hover:border-[#bdc1c6] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
          disabled && "opacity-60 cursor-not-allowed",
          className,
        )}
      >
        <input
          ref={ref}
          type={estaVisivel ? "text" : "password"}
          disabled={disabled}
          className="h-full min-w-0 w-full flex-1 border-0 bg-transparent px-3 py-0 text-[0.9375rem] leading-normal text-foreground outline-none placeholder:text-[14px] placeholder:text-[#80868b]"
          {...props}
        />
        <Button size="lg" className="mr-2 h-full"
          type="button"
          onClick={alternarVisibilidade}
          disabled={disabled}
          variante="ghost"

          aria-label={estaVisivel ? "Ocultar senha" : "Ver senha"}
          title={estaVisivel ? "Ocultar senha" : "Ver senha"}
          tabIndex={-1}
        >
          {estaVisivel ? (
            <EyeOff  aria-hidden="true" />
          ) : (
            <Eye  aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(campoBase, "min-h-[200px] resize-none py-2.5", className)}
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
