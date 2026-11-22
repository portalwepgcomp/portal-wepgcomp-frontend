"use client";

import { X } from "lucide-react";
import type { FiltrosLogsErro, NivelLog, OrigemLog } from "../tipos";
import {
  CHAVES_FILTRO,
  FILTROS_PADRAO,
  filtroAtivo,
  type ChaveFiltro,
} from "../lib/filtrosUrl";
import {
  ROTULO_NIVEL,
  ROTULO_NIVEL_USUARIO,
  ROTULO_ORIGEM,
  ROTULO_PERFIL,
} from "../lib/formatacao";

const ROTULOS: Record<ChaveFiltro, string> = {
  status: "Status",
  classe: "Classe",
  origem: "Origem",
  nivel: "Nível",
  excecao: "Exceção",
  prisma: "Prisma",
  metodo: "Método",
  contexto: "Contexto",
  rota: "Rota",
  caminho: "Caminho contém",
  arquivo: "Arquivo contém",
  mensagem: "Mensagem contém",
  usuario: "E-mail",
  nomeUsuario: "Nome",
  idUsuario: "ID do usuário",
  nivelUsuario: "Nível do usuário",
  perfil: "Perfil",
  autenticado: "Autenticado",
  requisicao: "Request ID",
};

function valorLegivel(filtros: FiltrosLogsErro, chave: ChaveFiltro): string {
  const valor = filtros[chave];
  if (chave === "autenticado") return valor ? "sim" : "não";
  if (!Array.isArray(valor)) return String(valor);
  const mapa: Partial<Record<ChaveFiltro, Record<string, string>>> = {
    origem: ROTULO_ORIGEM as Record<OrigemLog, string>,
    nivel: ROTULO_NIVEL as Record<NivelLog, string>,
    nivelUsuario: ROTULO_NIVEL_USUARIO,
    perfil: ROTULO_PERFIL,
  };
  const rotulos = (valor as (string | number)[]).map(
    (item) => mapa[chave]?.[String(item)] ?? String(item),
  );
  return rotulos.length > 2
    ? `${rotulos.slice(0, 2).join(", ")} +${rotulos.length - 2}`
    : rotulos.join(", ");
}

interface FiltrosAtivosProps {
  filtros: FiltrosLogsErro;
  aoRemover: (mudancas: Partial<FiltrosLogsErro>) => void;
  aoLimpar: () => void;
}

export default function FiltrosAtivos({
  filtros,
  aoRemover,
  aoLimpar,
}: Readonly<FiltrosAtivosProps>) {
  const ativos = CHAVES_FILTRO.filter((chave) => filtroAtivo(filtros, chave));
  if (ativos.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="Filtros aplicados"
    >
      {ativos.map((chave) => (
        <span
          key={chave}
          className="inline-flex max-w-full items-center gap-1 rounded-md border border-blue-800/20 bg-primary-light py-0.5 pl-2.5 pr-1 text-xs text-blue-800"
        >
          <span className="font-semibold">{ROTULOS[chave]}:</span>
          <span
            className="max-w-[18rem] truncate font-mono"
            title={valorLegivel(filtros, chave)}
          >
            {valorLegivel(filtros, chave)}
          </span>
          <button
            type="button"
            onClick={() => aoRemover({ [chave]: FILTROS_PADRAO[chave] })}
            aria-label={`Remover filtro ${ROTULOS[chave]}`}
            className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-blue-800/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={aoLimpar}
        className="rounded px-1.5 py-0.5 text-xs font-medium text-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50"
      >
        Limpar tudo
      </button>
    </div>
  );
}
