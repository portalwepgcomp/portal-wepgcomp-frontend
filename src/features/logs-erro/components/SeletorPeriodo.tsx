"use client";

import { Popover } from "@base-ui/react/popover";
import { CalendarRange } from "lucide-react";
import { useState } from "react";
import Button from "@/components/UI/Button";
import { cn } from "@/utils/cn";
import type { FiltrosLogsErro, PeriodoRapido } from "../tipos";
import { formatarDataCurta } from "../lib/formatacao";

const OPCOES: { valor: PeriodoRapido; rotulo: string; descricao: string }[] = [
  { valor: "1h", rotulo: "1h", descricao: "Última hora" },
  { valor: "24h", rotulo: "24h", descricao: "Últimas 24 horas" },
  { valor: "7d", rotulo: "7d", descricao: "Últimos 7 dias" },
  { valor: "30d", rotulo: "30d", descricao: "Últimos 30 dias" },
];

interface SeletorPeriodoProps {
  filtros: Pick<FiltrosLogsErro, "periodo" | "de" | "ate">;
  aoMudar: (mudancas: Pick<FiltrosLogsErro, "periodo" | "de" | "ate">) => void;
}

const estiloSegmento =
  "inline-flex h-9 items-center justify-center gap-1.5 px-3 text-sm font-medium transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50";

export default function SeletorPeriodo({
  filtros,
  aoMudar,
}: Readonly<SeletorPeriodoProps>) {
  const [aberto, setAberto] = useState(false);
  const [de, setDe] = useState(filtros.de ?? "");
  const [ate, setAte] = useState(filtros.ate ?? "");
  const personalizado = filtros.periodo === "personalizado";
  const intervaloInvalido = !!de && !!ate && de > ate;

  return (
    <div
      role="group"
      aria-label="Período"
      className="inline-flex shrink-0 overflow-hidden rounded-md border border-gray-300 bg-white"
    >
      {OPCOES.map((opcao) => {
        const ativo = filtros.periodo === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={ativo}
            title={opcao.descricao}
            onClick={() =>
              aoMudar({ periodo: opcao.valor, de: undefined, ate: undefined })
            }
            className={cn(
              estiloSegmento,
              "border-r border-gray-300 tabular-nums",
              ativo
                ? "bg-blue-800 text-white"
                : "text-foreground hover:bg-muted-light",
            )}
          >
            {opcao.rotulo}
          </button>
        );
      })}
      <Popover.Root
        open={aberto}
        onOpenChange={(proximo) => {
          setAberto(proximo);
          if (proximo) {
            setDe(filtros.de ?? "");
            setAte(filtros.ate ?? "");
          }
        }}
      >
        <Popover.Trigger
          aria-pressed={personalizado}
          className={cn(
            estiloSegmento,
            personalizado
              ? "bg-blue-800 text-white"
              : "text-foreground hover:bg-muted-light",
          )}
        >
          <CalendarRange className="h-4 w-4" aria-hidden />
          <span className="max-w-[16rem] truncate">
            {personalizado && filtros.de
              ? `${formatarDataCurta(filtros.de)} → ${filtros.ate ? formatarDataCurta(filtros.ate) : "agora"}`
              : "Intervalo"}
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8} align="end" className="z-[120]">
            <Popover.Popup className="w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-line bg-card p-4 shadow-lg outline-none transition-[opacity,transform] data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
              <Popover.Title className="m-0 mb-3 text-sm font-semibold text-foreground">
                Intervalo personalizado
              </Popover.Title>
              <form
                className="flex flex-col gap-3"
                onSubmit={(evento) => {
                  evento.preventDefault();
                  if (!de || intervaloInvalido) return;
                  aoMudar({
                    periodo: "personalizado",
                    de,
                    ate: ate || undefined,
                  });
                  setAberto(false);
                }}
              >
                <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                  De
                  <input
                    type="datetime-local"
                    required
                    value={de}
                    onChange={(e) => setDe(e.target.value)}
                    className="h-9 rounded-md border border-gray-300 px-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                  Até <span className="font-normal">(vazio = agora)</span>
                  <input
                    type="datetime-local"
                    value={ate}
                    onChange={(e) => setAte(e.target.value)}
                    aria-invalid={intervaloInvalido}
                    className="h-9 rounded-md border border-gray-300 px-2 text-sm text-foreground focus:border-primary focus:outline-none aria-[invalid=true]:border-error"
                  />
                </label>
                {intervaloInvalido && (
                  <p className="m-0 text-xs text-error-strong" role="alert">
                    O fim precisa ser depois do início.
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variante="ghost"
                    size="sm"
                    onClick={() => setAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variante="primary"
                    size="sm"
                    disabled={!de || intervaloInvalido}
                  >
                    Aplicar
                  </Button>
                </div>
              </form>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
