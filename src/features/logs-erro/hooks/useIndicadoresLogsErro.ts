"use client";

import { useQuery } from "@tanstack/react-query";
import { logsErroApi } from "@/services/logsErro";
import type { FiltrosLogsErro, ItemResumo } from "../tipos";
import {
  filtrosParaApi,
  intervaloAnterior,
  intervaloDoPeriodo,
} from "../lib/filtrosUrl";
import {
  CHAVE_LOGS,
  chaveDoRecorte,
  useLogsErroQuery,
  useResumoLogsErro,
} from "./useLogsErroQuery";

/** A API devolve no máximo 50 grupos por resumo. */
const LIMITE_RESUMO = 50;

export interface Indicadores {
  total: number;
  totalAnterior?: number;
  variacao?: number;
  servidor: number;
  cliente: number;
  foraDeRequisicao: number;
  usuariosAfetados: number;
  usuariosNoLimite: boolean;
}

function somarPorStatus(itens: ItemResumo[]) {
  return itens.reduce(
    (acc, { key, count }) => {
      const status = typeof key === "number" ? key : Number(key);
      if (key === null || Number.isNaN(status)) acc.foraDeRequisicao += count;
      else if (status >= 500) acc.servidor += count;
      else if (status >= 400) acc.cliente += count;
      return acc;
    },
    { servidor: 0, cliente: 0, foraDeRequisicao: 0 },
  );
}

export function useIndicadoresLogsErro(filtros: FiltrosLogsErro) {
  const lista = useLogsErroQuery(filtros);
  const porStatus = useResumoLogsErro(filtros, "statusCode");
  const porUsuario = useResumoLogsErro(filtros, "userEmail");

  const {
    pagina: _p,
    porPagina: _pp,
    ordenar: _o,
    ordem: _d,
    ...recorte
  } = chaveDoRecorte(filtros);
  const anterior = useQuery({
    queryKey: [CHAVE_LOGS, "total-anterior", recorte],
    queryFn: async ({ signal }) => {
      const intervalo = intervaloAnterior(
        intervaloDoPeriodo(filtros, new Date()),
      );
      const resposta = await logsErroApi.listar(
        { ...filtrosParaApi(filtros, intervalo), page: 1, pageSize: 1 },
        signal,
      );
      return resposta.total;
    },
  });

  const carregando =
    lista.isPending || porStatus.isPending || porUsuario.isPending;
  if (carregando || !lista.data || !porStatus.data || !porUsuario.data) {
    return {
      indicadores: undefined,
      carregando,
      erro: lista.error ?? porStatus.error,
    };
  }

  const usuarios = porUsuario.data.filter((item) => item.key !== null);
  const total = lista.data.total;
  const totalAnterior = anterior.data;
  const variacao =
    totalAnterior !== undefined && totalAnterior > 0
      ? (total - totalAnterior) / totalAnterior
      : undefined;

  const indicadores: Indicadores = {
    total,
    totalAnterior,
    variacao,
    ...somarPorStatus(porStatus.data),
    usuariosAfetados: usuarios.length,
    usuariosNoLimite: porUsuario.data.length >= LIMITE_RESUMO,
  };

  return { indicadores, carregando: false, erro: null };
}
