"use client";

import { useQuery } from "@tanstack/react-query";
import { logsErroApi } from "@/services/logsErro";
import type { FiltrosLogsErro } from "../tipos";
import {
  CHAVE_LOGS,
  chaveDoRecorte,
  parametrosAtuais,
} from "./useLogsErroQuery";

const INTERVALO_MS = 30_000;

/**
 * Conta registros mais novos que o primeiro da lista sem trocar a lista sob o
 * cursor do usuário — ele decide quando mostrar. Com o stream ao vivo, a
 * contagem só é refeita quando ele avisa; o intervalo é o plano B.
 */
export function useNovosRegistros(
  filtros: FiltrosLogsErro,
  maisRecente?: string,
  aoVivo = false,
) {
  const habilitado =
    !!maisRecente &&
    filtros.periodo !== "personalizado" &&
    filtros.ordenar === "createdAt" &&
    filtros.ordem === "desc" &&
    filtros.pagina === 1;

  const { data } = useQuery({
    queryKey: [CHAVE_LOGS, "novos", chaveDoRecorte(filtros), maisRecente],
    queryFn: async ({ signal }) => {
      const desde = new Date(
        new Date(maisRecente!).getTime() + 1,
      ).toISOString();
      const resposta = await logsErroApi.listar(
        { ...parametrosAtuais(filtros), from: desde, page: 1, pageSize: 1 },
        signal,
      );
      return resposta.total;
    },
    enabled: habilitado,
    refetchInterval: aoVivo ? false : INTERVALO_MS,
    refetchIntervalInBackground: false,
  });

  return habilitado ? (data ?? 0) : 0;
}
