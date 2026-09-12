"use client";

import Button from "@/components/UI/Button";
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
        "flex w-[28rem] max-w-full items-center gap-2",
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
        className="min-w-0 flex-1"
      />
      <Button size="lg"
        variante="primary"
        type="button"
        id="botao-busca"
        aria-label="Buscar"
      >
        <Search  />
      </Button>
    </div>
  );
}
