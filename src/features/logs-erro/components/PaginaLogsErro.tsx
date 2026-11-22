"use client";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Button from "@/components/UI/Button";
import PaginaListagem from "@/components/layout/PaginaListagem";
import Paginacao from "@/components/layout/Paginacao";
import { isAdminLevel } from "@/components/Perfil/perfilLabels";
import { useAuth } from "@/hooks/useAuth";
import type { PaginatedResponse } from "@/types/api";
import { getErrorMessage } from "@/utils/error";
import type {
  CampoOrdenacao,
  FiltrosLogsErro,
  LogErroResumo,
  OrigemLog,
} from "../tipos";
import { useFiltrosLogsErro } from "../hooks/useFiltrosLogsErro";
import {
  CHAVE_LOGS,
  chaveDoRecorte,
  useLogsErroQuery,
  usePrefetchLogErro,
  useResumoLogsErro,
} from "../hooks/useLogsErroQuery";
import { useIndicadoresLogsErro } from "../hooks/useIndicadoresLogsErro";
import { useNovosRegistros } from "../hooks/useNovosRegistros";
import { useTempoRealLogsErro } from "../hooks/useTempoRealLogsErro";
import { useVisoesSalvas } from "../hooks/useVisoesSalvas";
import { useAtalhosLogsErro } from "../hooks/useAtalhosLogsErro";
import { idsNovos, motivoPausa } from "../lib/tempoReal";
import {
  alternarFaceta,
  contarFiltrosAtivos,
  facetaAtiva,
  filtrosParaUrl,
  intervaloDoPeriodo,
  lerFiltrosDaUrl,
  limparFiltros,
  OPCOES_POR_PAGINA,
} from "../lib/filtrosUrl";
import { limitesDoDia, montarSerieDiaria } from "../lib/serieDiaria";
import BarraFerramentasLogs from "./BarraFerramentasLogs";
import VisoesRapidas from "./VisoesRapidas";
import FiltrosAtivos from "./FiltrosAtivos";
import FiltrosAvancados from "./FiltrosAvancados";
import FaixaIndicadores, { type AcaoIndicador } from "./FaixaIndicadores";
import GraficoOcorrenciasDia from "./GraficoOcorrenciasDia";
import PainelAgrupamentos from "./PainelAgrupamentos";
import TabelaLogs from "./TabelaLogs";
import AvisoNovosRegistros from "./AvisoNovosRegistros";
import IndicadorTempoReal from "./IndicadorTempoReal";
import {
  EsqueletoLinhas,
  EstadoErroLogs,
  EstadoVazioLogs,
} from "./EstadosLogs";

const PainelDetalheLog = dynamic(() => import("../detalhe/PainelDetalheLog"), {
  ssr: false,
});

const FORA_DE_REQUISICAO: OrigemLog[] = ["logger", "cron", "process"];
const mesmaLista = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((item) => b.includes(item));

function AcessoRestrito() {
  const router = useRouter();
  return (
    <PaginaListagem titulo="Logs de erro">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-line bg-card p-8 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error-light/60">
          <ShieldAlert className="h-7 w-7 text-error-strong" aria-hidden />
        </span>
        <h2 className="m-0 text-lg font-semibold text-foreground">
          Acesso restrito
        </h2>
        <p className="m-0 text-sm text-muted">
          Somente administradores podem consultar os logs de erro.
        </p>
        <Button variante="primary" onClick={() => router.push("/home")}>
          Voltar ao início
        </Button>
      </div>
    </PaginaListagem>
  );
}

function ConteudoLogsErro() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { filtros, consulta, atualizar, substituir } = useFiltrosLogsErro();
  const { visoes, salvar, remover } = useVisoesSalvas();
  const preCarregar = usePrefetchLogErro();

  const lista = useLogsErroQuery(filtros);
  const { indicadores, carregando: carregandoIndicadores } =
    useIndicadoresLogsErro(filtros);
  const serie = useResumoLogsErro(filtros, "day");
  const agrupamento = useResumoLogsErro(filtros, filtros.agrupar);
  const itens = useMemo(() => lista.data?.items ?? [], [lista.data]);

  const [agora, setAgora] = useState(() => new Date());
  const [focado, setFocado] = useState<number>();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [ponteiroNaTabela, setPonteiroNaTabela] = useState(false);
  const [topoForaDaTela, setTopoForaDaTela] = useState(false);
  const [novosIds, setNovosIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [anuncio, setAnuncio] = useState("");
  const buscaRef = useRef<HTMLInputElement>(null);
  const agrupamentosRef = useRef<HTMLDivElement>(null);
  const registrosRef = useRef<HTMLElement>(null);

  const motivo = motivoPausa({
    periodo: filtros.periodo,
    ordenar: filtros.ordenar,
    ordem: filtros.ordem,
    pagina: filtros.pagina,
    detalheAberto: !!filtros.log,
    linhaSelecionada: focado !== undefined,
    ponteiroNaTabela,
    topoForaDaTela,
  });

  // Os avisos do stream chegam fora do render: leem sempre o estado atual.
  const filtrosRef = useRef(filtros);
  filtrosRef.current = filtros;
  const itensRef = useRef(itens);
  itensRef.current = itens;
  const motivoRef = useRef(motivo);
  motivoRef.current = motivo;

  const inserirNovos = useCallback(async () => {
    const chave = [CHAVE_LOGS, "lista", chaveDoRecorte(filtrosRef.current)];
    const antes = itensRef.current.map((item) => item.id);
    await queryClient.refetchQueries({ queryKey: chave, exact: true });
    const dados =
      queryClient.getQueryData<PaginatedResponse<LogErroResumo>>(chave);
    const chegaram = idsNovos(antes, dados?.items.map((item) => item.id) ?? []);
    if (chegaram.length === 0) return;
    setNovosIds(new Set(chegaram));
    setAnuncio(
      chegaram.length === 1
        ? "1 novo erro no topo da lista"
        : `${chegaram.length} novos erros no topo da lista`,
    );
  }, [queryClient]);

  const atualizarResumos = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [CHAVE_LOGS, "resumo"] }),
    [queryClient],
  );

  const estadoTempoReal = useTempoRealLogsErro({
    habilitado: true,
    aoAtualizarLista: () => {
      if (motivoRef.current) {
        queryClient.invalidateQueries({ queryKey: [CHAVE_LOGS, "novos"] });
      } else {
        void inserirNovos();
      }
    },
    aoAtualizarResumos: () => {
      if (motivoRef.current !== "periodo") void atualizarResumos();
    },
  });
  const aoVivo = estadoTempoReal === "ao-vivo";
  const novos = useNovosRegistros(filtros, itens[0]?.createdAt, aoVivo);

  // Pausa terminou com registros esperando: entram sem precisar de clique.
  useEffect(() => {
    if (aoVivo && !motivo && novos > 0) void inserirNovos();
  }, [aoVivo, motivo, novos, inserirNovos]);

  useEffect(() => {
    if (novosIds.size === 0) return;
    const id = setTimeout(() => setNovosIds(new Set()), 3_000);
    return () => clearTimeout(id);
  }, [novosIds]);

  const mostrarNovos = () => {
    if (topoForaDaTela) {
      registrosRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    void inserirNovos();
    void atualizarResumos();
  };

  useEffect(() => setAgora(new Date()), [lista.dataUpdatedAt]);
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => setFocado(undefined), [lista.data]);

  const totalPaginas = lista.data?.totalPages ?? 1;
  useEffect(() => {
    if (lista.data && lista.data.total > 0 && filtros.pagina > totalPaginas) {
      atualizar({ pagina: totalPaginas });
    }
  }, [lista.data, filtros.pagina, totalPaginas, atualizar]);

  const recarregar = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === CHAVE_LOGS && query.queryKey[1] !== "detalhe",
    });
  }, [queryClient]);

  const abrir = useCallback(
    (id: string) => atualizar({ log: id }, filtros.log ? "replace" : "push"),
    [atualizar, filtros.log],
  );

  const indiceAberto = filtros.log
    ? itens.findIndex((item) => item.id === filtros.log)
    : -1;

  useAtalhosLogsErro({
    focarBusca: () => buscaRef.current?.focus(),
    proximo: () =>
      setFocado((atual) => Math.min(itens.length - 1, (atual ?? -1) + 1)),
    anterior: () => setFocado((atual) => Math.max(0, (atual ?? 1) - 1)),
    abrirSelecionado: () =>
      focado !== undefined && itens[focado] && abrir(itens[focado].id),
    atualizar: recarregar,
    alternarAjuda: () => setAjudaAberta((aberta) => !aberta),
  });

  const ordenarPor = (campo: CampoOrdenacao) =>
    atualizar({
      ordenar: campo,
      ordem:
        filtros.ordenar === campo && filtros.ordem === "desc" ? "asc" : "desc",
    });

  const ativos = {
    servidor: mesmaLista(filtros.classe, ["5xx"]),
    cliente: mesmaLista(filtros.classe, ["4xx"]),
    foraDeRequisicao: mesmaLista(filtros.origem, FORA_DE_REQUISICAO),
    usuarios: filtros.agrupar === "userEmail",
  };

  const aoSelecionarIndicador = (acao: AcaoIndicador) => {
    if (acao === "servidor")
      atualizar({ classe: ativos.servidor ? [] : ["5xx"] });
    if (acao === "cliente")
      atualizar({ classe: ativos.cliente ? [] : ["4xx"] });
    if (acao === "foraDeRequisicao") {
      atualizar({ origem: ativos.foraDeRequisicao ? [] : FORA_DE_REQUISICAO });
    }
    if (acao === "usuarios") {
      atualizar({ agrupar: "userEmail" });
      agrupamentosRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const intervalo = intervaloDoPeriodo(filtros, agora);
  const pontos = serie.data ? montarSerieDiaria(serie.data, intervalo) : [];
  const diaSelecionado =
    filtros.periodo === "personalizado" && filtros.de
      ? pontos.find((p) => {
          const limites = limitesDoDia(p.dia);
          return limites.de === filtros.de && limites.ate === filtros.ate;
        })?.dia
      : undefined;

  const totalFiltros = contarFiltrosAtivos(filtros);
  const carregandoLista = lista.isPending;
  const trocandoPagina = lista.isFetching && lista.isPlaceholderData;

  return (
    <PaginaListagem titulo="Logs de erro">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          size="sm"
          variante="outline"
          onClick={() => router.push("/gerenciamento")}
        >
          <ArrowLeft aria-hidden />
          Gerenciamento
        </Button>
        <p className="m-0 text-xs text-muted">
          Falhas capturadas automaticamente pela API · horários de Brasília ·
          retenção de 90 dias
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <BarraFerramentasLogs
          filtros={filtros}
          consulta={consulta}
          totalFiltros={totalFiltros}
          atualizando={lista.isFetching}
          atualizadoEm={lista.dataUpdatedAt || undefined}
          buscaRef={buscaRef}
          ajudaAberta={ajudaAberta}
          aoMudarAjuda={setAjudaAberta}
          aoMudar={atualizar}
          aoAbrirFiltros={() => setFiltrosAbertos(true)}
          aoAtualizar={recarregar}
          indicador={
            <IndicadorTempoReal estado={estadoTempoReal} motivo={motivo} />
          }
          visoes={visoes}
          aoAbrirVisao={(consultaSalva) =>
            substituir(lerFiltrosDaUrl(new URLSearchParams(consultaSalva)))
          }
          aoSalvarVisao={(nome) =>
            salvar(
              nome,
              filtrosParaUrl({ ...filtros, log: undefined, pagina: 1 }),
            )
          }
          aoRemoverVisao={remover}
        />
        <VisoesRapidas filtros={filtros} aoAplicar={substituir} />
        <FiltrosAtivos
          filtros={filtros}
          aoRemover={(mudancas) => atualizar(mudancas)}
          aoLimpar={() => substituir(limparFiltros(filtros))}
        />
      </div>

      <FaixaIndicadores
        indicadores={indicadores}
        carregando={carregandoIndicadores}
        ativos={ativos}
        aoSelecionar={aoSelecionarIndicador}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <GraficoOcorrenciasDia
            serie={pontos}
            carregando={serie.isPending}
            diaSelecionado={diaSelecionado}
            aoSelecionarDia={(dia) =>
              diaSelecionado === dia
                ? atualizar({ periodo: "7d", de: undefined, ate: undefined })
                : atualizar({ periodo: "personalizado", ...limitesDoDia(dia) })
            }
          />
        </div>
        <div className="lg:col-span-2" ref={agrupamentosRef}>
          <PainelAgrupamentos
            campo={filtros.agrupar}
            aoMudarCampo={(agrupar) => atualizar({ agrupar })}
            itens={agrupamento.data}
            carregando={agrupamento.isPending}
            estaAtivo={(chave) => facetaAtiva(filtros, filtros.agrupar, chave)}
            aoAlternar={(chave) =>
              atualizar(alternarFaceta(filtros, filtros.agrupar, chave))
            }
          />
        </div>
      </div>

      <section
        ref={registrosRef}
        aria-labelledby="titulo-registros"
        className="relative scroll-mt-4 overflow-hidden rounded-lg border border-line bg-card shadow-sm"
      >
        <p className="sr-only" aria-live="polite">
          {anuncio}
        </p>
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-baseline gap-2">
            <h2
              id="titulo-registros"
              className="m-0 text-sm font-semibold text-foreground"
            >
              Registros
            </h2>
            {lista.data && (
              <span
                className="text-xs tabular-nums text-muted"
                aria-live="polite"
              >
                {lista.data.total.toLocaleString("pt-BR")} resultado(s)
              </span>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted md:hidden">
            Ordenar
            <select
              value={`${filtros.ordenar}:${filtros.ordem}`}
              onChange={(e) => {
                const [ordenar, ordem] = e.target.value.split(":") as [
                  CampoOrdenacao,
                  "asc" | "desc",
                ];
                atualizar({ ordenar, ordem });
              }}
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-foreground"
            >
              <option value="createdAt:desc">Mais recentes</option>
              <option value="createdAt:asc">Mais antigos</option>
              <option value="statusCode:desc">Maior status</option>
              <option value="exceptionName:asc">Exceção (A–Z)</option>
              <option value="userEmail:asc">Usuário (A–Z)</option>
            </select>
          </label>
          <span className="hidden text-[11px] text-muted md:inline">
            Clique numa linha para ver pilha, requisição e consultas
          </span>
        </header>

        {trocandoPagina && (
          <div
            className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-primary-light"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-[pulse_1s_ease-in-out_infinite] bg-blue-800" />
          </div>
        )}

        <AvisoNovosRegistros
          quantidade={novos}
          fixo={topoForaDaTela}
          aoMostrar={mostrarNovos}
        />

        <div
          className={
            trocandoPagina ? "opacity-60 transition-opacity" : undefined
          }
        >
          {carregandoLista ? (
            <EsqueletoLinhas />
          ) : lista.isError ? (
            <EstadoErroLogs
              mensagem={getErrorMessage(
                lista.error,
                "Tente novamente em instantes.",
              )}
              aoTentar={() => lista.refetch()}
            />
          ) : itens.length === 0 ? (
            <EstadoVazioLogs
              comFiltros={totalFiltros > 0 || !!filtros.busca}
              aoLimpar={() => substituir(limparFiltros(filtros))}
              aoAmpliarPeriodo={() =>
                atualizar({ periodo: "30d", de: undefined, ate: undefined })
              }
            />
          ) : (
            <TabelaLogs
              itens={itens}
              selecionado={filtros.log}
              focado={focado}
              ordenar={filtros.ordenar}
              ordem={filtros.ordem}
              agora={agora}
              novosIds={novosIds}
              aoOrdenar={ordenarPor}
              aoAbrir={abrir}
              aoPreCarregar={preCarregar}
              aoMudarPonteiro={setPonteiroNaTabela}
              aoMudarTopoForaDaTela={setTopoForaDaTela}
            />
          )}
        </div>

        {lista.data && lista.data.total > 0 && (
          <footer className="border-t border-line px-4 py-3 sm:px-5">
            <Paginacao
              pagina={filtros.pagina}
              totalPaginas={totalPaginas}
              total={lista.data.total}
              porPagina={filtros.porPagina}
              opcoesPorPagina={OPCOES_POR_PAGINA}
              aoMudarPagina={(pagina) => atualizar({ pagina })}
              aoMudarPorPagina={(porPagina) => atualizar({ porPagina })}
            />
          </footer>
        )}
      </section>

      <FiltrosAvancados
        aberto={filtrosAbertos}
        aoMudarAberto={setFiltrosAbertos}
        filtros={filtros}
        aoAplicar={(proximos: FiltrosLogsErro) =>
          substituir({ ...proximos, log: undefined })
        }
      />

      <PainelDetalheLog
        id={filtros.log}
        anteriorId={indiceAberto > 0 ? itens[indiceAberto - 1]?.id : undefined}
        proximoId={indiceAberto >= 0 ? itens[indiceAberto + 1]?.id : undefined}
        aoFechar={() => atualizar({ log: undefined })}
        aoNavegar={(id) => atualizar({ log: id })}
        aoFiltrar={(mudancas) =>
          substituir({ ...limparFiltros(filtros), ...mudancas, log: undefined })
        }
      />
    </PaginaListagem>
  );
}

export default function PaginaLogsErro() {
  const { user } = useAuth();
  if (!isAdminLevel(user?.level)) return <AcessoRestrito />;
  return <ConteudoLogsErro />;
}
