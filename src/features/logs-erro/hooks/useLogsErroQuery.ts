"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { logsErroApi } from "@/services/logsErro";
import type { CampoAgrupamento, FiltrosLogsErro } from "../tipos";
import { filtrosParaApi, intervaloDoPeriodo } from "../lib/filtrosUrl";

export const CHAVE_LOGS = "error-logs";

/** O que define o recorte dos dados — abrir um detalhe ou trocar o agrupamento não refaz a lista. */
export function chaveDoRecorte(filtros: FiltrosLogsErro) {
  const { log: _log, agrupar: _agrupar, ...recorte } = filtros;
  return recorte;
}

/** Período relativo é recalculado a cada busca, então "últimas 24h" nunca fica parado. */
export function parametrosAtuais(filtros: FiltrosLogsErro) {
  return filtrosParaApi(filtros, intervaloDoPeriodo(filtros, new Date()));
}

export function useLogsErroQuery(filtros: FiltrosLogsErro) {
  return useQuery({
    queryKey: [CHAVE_LOGS, "lista", chaveDoRecorte(filtros)],
    queryFn: ({ signal }) =>
      logsErroApi.listar(parametrosAtuais(filtros), signal),
    placeholderData: keepPreviousData,
  });
}

export function useResumoLogsErro(
  filtros: FiltrosLogsErro,
  campo: CampoAgrupamento,
  habilitado = true,
) {
  const {
    pagina: _p,
    porPagina: _pp,
    ordenar: _o,
    ordem: _d,
    ...recorte
  } = chaveDoRecorte(filtros);

  return useQuery({
    queryKey: [CHAVE_LOGS, "resumo", campo, recorte],
    queryFn: ({ signal }) => {
      const {
        page: _page,
        pageSize: _size,
        sortBy: _sort,
        sortOrder: _order,
        ...params
      } = parametrosAtuais(filtros);
      return logsErroApi.resumir({ ...params, groupBy: campo }, signal);
    },
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}

export function useLogErroDetalhe(id: string | undefined) {
  return useQuery({
    queryKey: [CHAVE_LOGS, "detalhe", id],
    queryFn: ({ signal }) => logsErroApi.buscarPorId(id!, signal),
    enabled: !!id,
    // Registros de erro não mudam depois de gravados.
    staleTime: Infinity,
  });
}

export function usePrefetchLogErro() {
  const queryClient = useQueryClient();
  return (id: string) =>
    queryClient.prefetchQuery({
      queryKey: [CHAVE_LOGS, "detalhe", id],
      queryFn: ({ signal }) => logsErroApi.buscarPorId(id, signal),
      staleTime: Infinity,
    });
}
