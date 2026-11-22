"use client";

import { cn } from "@/utils/cn";
import type { FiltrosLogsErro } from "../tipos";
import { FILTROS_PADRAO, limparFiltros } from "../lib/filtrosUrl";

const PRISMA_EXCECOES = [
  "PrismaClientKnownRequestError",
  "PrismaClientInitializationError",
  "PrismaClientValidationError",
  "PrismaClientUnknownRequestError",
];

interface VisaoRapida {
  id: string;
  rotulo: string;
  filtros: Partial<FiltrosLogsErro>;
}

export const VISOES_RAPIDAS: VisaoRapida[] = [
  {
    id: "servidor",
    rotulo: "Falhas do servidor",
    filtros: { classe: ["5xx"] },
  },
  {
    id: "banco",
    rotulo: "Banco de dados",
    filtros: { excecao: PRISMA_EXCECOES },
  },
  { id: "sessao", rotulo: "Sessão expirada", filtros: { status: [401] } },
  { id: "validacao", rotulo: "Validação", filtros: { status: [400] } },
  { id: "tarefas", rotulo: "Tarefas agendadas", filtros: { origem: ["cron"] } },
  {
    id: "autenticados",
    rotulo: "Usuários logados",
    filtros: { autenticado: true },
  },
];

const mesmoValor = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Ativa quando os filtros da visão estão aplicados exatamente como ela define. */
export function visaoAtiva(
  filtros: FiltrosLogsErro,
  visao: VisaoRapida,
): boolean {
  return Object.entries(visao.filtros).every(([chave, valor]) =>
    mesmoValor(filtros[chave as keyof FiltrosLogsErro], valor),
  );
}

interface VisoesRapidasProps {
  filtros: FiltrosLogsErro;
  aoAplicar: (filtros: FiltrosLogsErro) => void;
}

export default function VisoesRapidas({
  filtros,
  aoAplicar,
}: Readonly<VisoesRapidasProps>) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Visões rápidas"
    >
      <span className="text-xs font-medium text-muted">Visões rápidas:</span>
      {VISOES_RAPIDAS.map((visao) => {
        const ativa = visaoAtiva(filtros, visao);
        return (
          <button
            key={visao.id}
            type="button"
            aria-pressed={ativa}
            onClick={() => {
              if (ativa) {
                const desfeitos = Object.fromEntries(
                  Object.keys(visao.filtros).map((chave) => [
                    chave,
                    FILTROS_PADRAO[chave as keyof FiltrosLogsErro],
                  ]),
                );
                aoAplicar({ ...filtros, ...desfeitos });
              } else {
                aoAplicar({
                  ...limparFiltros(filtros),
                  busca: filtros.busca,
                  ...visao.filtros,
                });
              }
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50",
              ativa
                ? "border-blue-800 bg-blue-800 text-white"
                : "border-line bg-card text-foreground hover:border-blue-800/40 hover:bg-primary-light",
            )}
          >
            {visao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
