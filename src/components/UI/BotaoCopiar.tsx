"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface BotaoCopiarProps {
  texto: string | (() => string);
  rotulo: string;
  children?: ReactNode;
  className?: string;
  compacto?: boolean;
}

export default function BotaoCopiar({
  texto,
  rotulo,
  children,
  className,
  compacto = false,
}: Readonly<BotaoCopiarProps>) {
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof texto === "function" ? texto() : texto,
      );
      setCopiado(true);
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  };

  const Icone = copiado ? Check : Copy;

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={children ? undefined : rotulo}
      title={rotulo}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted transition-colors hover:bg-muted-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50",
        compacto ? "h-7 w-7 justify-center" : "h-8 px-2.5",
        copiado && "text-success",
        className,
      )}
    >
      <Icone className="h-4 w-4 shrink-0" aria-hidden />
      {children}
      <span aria-live="polite" className="sr-only">
        {copiado ? "Copiado" : ""}
      </span>
    </button>
  );
}
