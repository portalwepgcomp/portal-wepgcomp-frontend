"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Estilo base compartilhado para os campos de entrada de texto.
 * Garante altura, bordas, transições e anel de foco padronizados.
 */
const campoBase =
  "w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-[0.9375rem] leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-[#80868b] disabled:opacity-60 disabled:cursor-not-allowed";

/**
 * Componente Input básico do design system.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(campoBase, className)} {...props} />;
  },
);

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Permite controlar externamente a visibilidade da senha (opcional) */
  mostrarSenha?: boolean;
  /** Callback acionado ao alternar a visibilidade (opcional) */
  onToggleMostrarSenha?: () => void;
}

/**
 * Componente PasswordInput com alternância de visibilidade integrada e ícones Lucide.
 * Funciona de forma autônoma (estado interno) ou controlada (via props).
 */
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

    // Se a visibilidade foi passada via prop, usamos ela; caso contrário, usamos o estado interno.
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
          "relative flex w-full items-center rounded-md border border-[#d9dce0] bg-white transition hover:border-[#bdc1c6] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
          disabled && "opacity-60 cursor-not-allowed",
          className,
        )}
      >
        <input
          ref={ref}
          type={estaVisivel ? "text" : "password"}
          disabled={disabled}
          className="w-full flex-1 border-0 bg-transparent px-3 py-2.5 text-[0.9375rem] leading-normal text-foreground outline-none placeholder:text-[#80868b]"
          {...props}
        />
        <button
          type="button"
          onClick={alternarVisibilidade}
          disabled={disabled}
          className="flex h-full items-center justify-center border-0 bg-transparent px-3 text-muted hover:text-foreground focus:outline-none"
          aria-label={estaVisivel ? "Ocultar senha" : "Ver senha"}
          title={estaVisivel ? "Ocultar senha" : "Ver senha"}
          tabIndex={-1}
        >
          {estaVisivel ? (
            <EyeOff className="h-4 w-4 text-brand-blue" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-[#80868b]" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);

/**
 * Componente Textarea estilizado para textos longos (ex.: resumos, observações).
 */
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

/**
 * Componente contêiner de formulário que agrupa Label, Controle de Entrada e Mensagem de Erro.
 */
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
