"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { encerrarSessaoExpirada } from "@/lib/api";
import { conectarStreamLogs, ErroFatalStream } from "../lib/streamLogsErro";
import {
  atrasoAteAtualizar,
  atrasoReconexao,
  type EstadoTempoReal,
} from "../lib/tempoReal";

/** Dois pings do servidor (25s) perdidos, com folga. */
const LIMITE_SILENCIO_MS = 55_000;
const ESPERA_RAJADA_MS = 1_000;
const INTERVALO_LISTA_MS = 3_000;
const INTERVALO_RESUMOS_MS = 10_000;
/** Falhas seguidas até o indicador admitir que caiu para o polling. */
const FALHAS_ATE_INDISPONIVEL = 3;

function useAbaVisivel() {
  const [visivel, setVisivel] = useState(
    () =>
      typeof document === "undefined" || document.visibilityState === "visible",
  );
  useEffect(() => {
    const aoMudar = () => setVisivel(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);
  return visivel;
}

/** Agrupa chamadas em rajada: no máximo uma execução a cada `intervalo`. */
function useAgendador(acao: () => void, intervalo: number) {
  const acaoRef = useRef(acao);
  acaoRef.current = acao;
  const ultima = useRef(0);
  const pendente = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(pendente.current), []);

  return useCallback(() => {
    if (pendente.current) return;
    pendente.current = setTimeout(
      () => {
        pendente.current = undefined;
        ultima.current = Date.now();
        acaoRef.current();
      },
      atrasoAteAtualizar(
        Date.now(),
        ultima.current,
        intervalo,
        ESPERA_RAJADA_MS,
      ),
    );
  }, [intervalo]);
}

interface OpcoesTempoReal {
  habilitado: boolean;
  /** Chegaram registros novos; no máximo a cada 3s. */
  aoAtualizarLista: () => void;
  /** Indicadores, gráfico e agrupamentos; no máximo a cada 10s. */
  aoAtualizarResumos: () => void;
}

/**
 * Mantém o stream `/error-logs/stream` aberto enquanto a aba está visível,
 * reconectando com espera crescente. Sem stream, a tela segue no polling.
 */
export function useTempoRealLogsErro({
  habilitado,
  aoAtualizarLista,
  aoAtualizarResumos,
}: OpcoesTempoReal): EstadoTempoReal {
  const visivel = useAbaVisivel();
  const [estado, setEstado] = useState<EstadoTempoReal>("conectando");
  const agendarLista = useAgendador(aoAtualizarLista, INTERVALO_LISTA_MS);
  const agendarResumos = useAgendador(aoAtualizarResumos, INTERVALO_RESUMOS_MS);
  const jaConectou = useRef(false);

  useEffect(() => {
    if (!habilitado || !visivel) return;

    let ativo = true;
    let falhas = 0;
    let controle: AbortController | undefined;
    let espera: ReturnType<typeof setTimeout> | undefined;
    let vigia: ReturnType<typeof setTimeout> | undefined;

    const aoChegar = () => {
      agendarLista();
      agendarResumos();
    };

    // Proxy que segura a resposta ou conexão morta sem FIN: sem dados, reabre.
    const armarVigia = () => {
      clearTimeout(vigia);
      vigia = setTimeout(() => controle?.abort(), LIMITE_SILENCIO_MS);
    };

    const conectar = async () => {
      const token = localStorage.getItem("@Auth:token");
      if (!token) {
        setEstado("indisponivel");
        return;
      }

      controle = new AbortController();
      armarVigia();
      try {
        await conectarStreamLogs({
          token,
          signal: controle.signal,
          aoAbrir: () => {
            falhas = 0;
            setEstado("ao-vivo");
            // Cobre o que chegou enquanto a conexão esteve fechada.
            if (jaConectou.current) aoChegar();
            jaConectou.current = true;
          },
          aoReceber: aoChegar,
          aoSinalDeVida: armarVigia,
        });
      } catch (erro) {
        if (!ativo) return;
        if (erro instanceof ErroFatalStream) {
          clearTimeout(vigia);
          if (erro.status === 401) encerrarSessaoExpirada();
          setEstado("indisponivel");
          return;
        }
      }

      clearTimeout(vigia);
      if (!ativo) return;
      falhas += 1;
      setEstado(
        falhas >= FALHAS_ATE_INDISPONIVEL ? "indisponivel" : "reconectando",
      );
      espera = setTimeout(conectar, atrasoReconexao(falhas));
    };

    setEstado("conectando");
    void conectar();

    return () => {
      ativo = false;
      clearTimeout(espera);
      clearTimeout(vigia);
      controle?.abort();
    };
  }, [habilitado, visivel, agendarLista, agendarResumos]);

  return habilitado ? estado : "indisponivel";
}
