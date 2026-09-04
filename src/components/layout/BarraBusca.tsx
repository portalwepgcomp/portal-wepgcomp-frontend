"use client";

import Image from "next/image";
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

/**
 * Campo de busca reutilizável (input + ícone). Extraído de `ListagemToolbar`.
 * Puro: recebe valor e onChange; sem estado nem domínio.
 */
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
        "flex max-w-96 max-[980px]:min-w-0 max-md:w-full",
        ocultar && "invisible",
        className,
      )}
      style={{ minWidth: ocultar ? undefined : "350px" }}
    >
      <Input
        placeholder={placeholder}
        type="text"
        aria-label="campo de busca"
        aria-describedby="botao-busca"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-r-none border-[3px] border-brand-orange"
      />
      <button
        className="flex items-center justify-center rounded-r-md border border-l-0 border-line bg-white px-3"
        type="button"
        id="botao-busca"
        aria-label="Buscar"
      >
        <Image src="/assets/images/search.svg" alt="" width={24} height={24} />
      </button>
    </div>
  );
}
