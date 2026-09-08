"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/UI/Input";
import { cn } from "@/utils/cn";

interface BarraBuscaProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  /** Mantém o espaço no layout mas esconde o campo (ex.: "minha apresentação"). */
  ocultar?: boolean;
  className?: string;
}

export default function BarraBusca({
  valor,
  onChange,
  placeholder = "Buscar",
  ocultar,
  className,
}: Readonly<BarraBuscaProps>) {
  return (
    <div
      className={cn(
        "flex w-full max-w-md items-stretch",
        ocultar && "invisible",
        className,
      )}
    >
      <Input
        placeholder={placeholder}
        type="text"
        aria-label="campo de busca"
        aria-describedby="botao-busca"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-r-none border-[2px] border-brand-orange focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
      />
      <button
        className="flex items-center justify-center rounded-r-md border border-brand-orange bg-brand-orange px-4 text-white transition-colors duration-200 hover:bg-orange-600 focus:outline-none"
        type="button"
        id="botao-busca"
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
