"use client";

import { cn } from "@/utils/cn";
import {
  DESCRICAO_PAUSA,
  type EstadoTempoReal,
  type MotivoPausa,
} from "../lib/tempoReal";

interface Aparencia {
  rotulo: string;
  dica: string;
  ponto: string;
  pulsar?: boolean;
  texto: string;
}

function aparencia(
  estado: EstadoTempoReal,
  motivo: MotivoPausa | null,
): Aparencia {
  if (estado === "ao-vivo" && motivo) {
    return {
      rotulo: "Pausado",
      dica: `Tempo real pausado: ${DESCRICAO_PAUSA[motivo]}. Os registros novos ficam no aviso acima da tabela.`,
      ponto: "bg-warning",
      texto: "text-warning",
    };
  }
  if (estado === "ao-vivo") {
    return {
      rotulo: "Ao vivo",
      dica: "Erros novos entram sozinhos no topo da lista.",
      ponto: "bg-success",
      pulsar: true,
      texto: "text-success",
    };
  }
  if (estado === "indisponivel") {
    return {
      rotulo: "A cada 30s",
      dica: "Tempo real indisponível: a lista é verificada a cada 30 segundos.",
      ponto: "border border-muted bg-transparent",
      texto: "text-muted",
    };
  }
  return {
    rotulo: estado === "conectando" ? "Conectando…" : "Reconectando…",
    dica: "Abrindo a conexão de tempo real com a API.",
    ponto: "bg-muted/60",
    texto: "text-muted",
  };
}

export default function IndicadorTempoReal({
  estado,
  motivo,
}: Readonly<{ estado: EstadoTempoReal; motivo: MotivoPausa | null }>) {
  const { rotulo, dica, ponto, pulsar, texto } = aparencia(estado, motivo);

  return (
    <span
      title={dica}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-line bg-white px-2.5 text-xs font-semibold",
        texto,
      )}
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        {pulsar && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
        )}
        <span
          className={cn("relative inline-flex h-2 w-2 rounded-full", ponto)}
        />
      </span>
      <span className="hidden sm:inline">{rotulo}</span>
      <span className="sr-only sm:hidden">{rotulo}</span>
    </span>
  );
}
