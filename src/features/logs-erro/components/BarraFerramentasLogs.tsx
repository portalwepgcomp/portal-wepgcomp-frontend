"use client";

import { Popover } from "@base-ui/react/popover";
import {
  Bookmark,
  Keyboard,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import Button from "@/components/UI/Button";
import { cn } from "@/utils/cn";
import type { FiltrosLogsErro } from "../tipos";
import type { VisaoSalva } from "../hooks/useVisoesSalvas";
import SeletorPeriodo from "./SeletorPeriodo";

const ATALHOS: [string, string][] = [
  ["/", "Buscar"],
  ["j / k", "Próximo / anterior registro"],
  ["Enter", "Abrir registro selecionado"],
  ["r", "Atualizar dados"],
  ["Esc", "Fechar painel"],
  ["?", "Mostrar atalhos"],
];

function Tecla({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-line bg-muted-light px-1.5 py-px font-mono text-[11px] font-semibold text-muted">
      {children}
    </kbd>
  );
}

const estiloPopup =
  "rounded-lg border border-line bg-card shadow-lg outline-none transition-[opacity,transform] data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0";

const estiloBotaoFerramenta =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50";

interface BuscaProps {
  valor: string;
  aoMudar: (valor: string) => void;
}

/** Busca com espera de 350 ms para não disparar uma consulta por tecla. */
const CampoBusca = forwardRef<HTMLInputElement, BuscaProps>(function CampoBusca(
  { valor, aoMudar },
  ref,
) {
  const [texto, setTexto] = useState(valor);
  const aoMudarRef = useRef(aoMudar);
  aoMudarRef.current = aoMudar;

  useEffect(() => setTexto(valor), [valor]);

  useEffect(() => {
    if (texto === valor) return;
    const id = setTimeout(() => aoMudarRef.current(texto), 350);
    return () => clearTimeout(id);
  }, [texto, valor]);

  return (
    <div className="relative min-w-0 flex-1 basis-64">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        ref={ref}
        id="busca-logs"
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && texto) {
            e.preventDefault();
            setTexto("");
          }
        }}
        placeholder="Buscar em mensagem, e-mail, nome, caminho ou exceção"
        aria-label="Buscar nos logs de erro"
        className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-16 text-sm text-foreground transition placeholder:text-[#80868b] hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
      />
      <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {texto ? (
          <button
            type="button"
            onClick={() => setTexto("")}
            aria-label="Limpar busca"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted hover:bg-muted-light hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : (
          <Tecla>/</Tecla>
        )}
      </span>
    </div>
  );
});

interface MenuVisoesProps {
  visoes: VisaoSalva[];
  consultaAtual: string;
  aoAbrir: (consulta: string) => void;
  aoSalvar: (nome: string) => void;
  aoRemover: (id: string) => void;
}

function MenuVisoesSalvas({
  visoes,
  consultaAtual,
  aoAbrir,
  aoSalvar,
  aoRemover,
}: Readonly<MenuVisoesProps>) {
  const [nome, setNome] = useState("");
  const [aberto, setAberto] = useState(false);

  return (
    <Popover.Root open={aberto} onOpenChange={setAberto}>
      <Popover.Trigger
        className={estiloBotaoFerramenta}
        aria-label="Visões salvas"
      >
        <Bookmark className="h-4 w-4" aria-hidden />
        <span className="hidden xl:inline">Visões</span>
        {visoes.length > 0 && (
          <span className="rounded-full bg-muted-light px-1.5 text-[11px] font-semibold tabular-nums text-muted">
            {visoes.length}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" className="z-[120]">
          <Popover.Popup
            className={cn(estiloPopup, "w-[min(20rem,calc(100vw-2rem))] p-3")}
          >
            <Popover.Title className="m-0 mb-2 px-1 text-sm font-semibold text-foreground">
              Visões salvas
            </Popover.Title>
            {visoes.length === 0 ? (
              <p className="m-0 mb-3 px-1 text-xs text-muted">
                Guarde combinações de filtros que você consulta sempre. Ficam
                salvas neste navegador.
              </p>
            ) : (
              <ul className="m-0 mb-3 flex list-none flex-col gap-0.5 p-0">
                {visoes.map((visao) => (
                  <li key={visao.id} className="group flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        aoAbrir(visao.consulta);
                        setAberto(false);
                      }}
                      className={cn(
                        "min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted-light",
                        visao.consulta === consultaAtual &&
                          "font-semibold text-blue-800",
                      )}
                    >
                      {visao.nome}
                    </button>
                    <button
                      type="button"
                      onClick={() => aoRemover(visao.id)}
                      aria-label={`Remover visão ${visao.nome}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-muted opacity-60 hover:bg-error-light/60 hover:text-error-strong group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form
              className="flex gap-2 border-t border-line pt-3"
              onSubmit={(evento) => {
                evento.preventDefault();
                if (!nome.trim()) return;
                aoSalvar(nome);
                setNome("");
              }}
            >
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da visão atual"
                aria-label="Nome da visão atual"
                maxLength={60}
                className="h-8 min-w-0 flex-1 rounded-md border border-gray-300 px-2 text-sm focus:border-primary focus:outline-none"
              />
              <Button
                type="submit"
                size="sm"
                variante="primary"
                disabled={!nome.trim()}
              >
                Salvar
              </Button>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function AjudaAtalhos({
  aberto,
  aoMudarAberto,
}: Readonly<{ aberto: boolean; aoMudarAberto: (aberto: boolean) => void }>) {
  return (
    <Popover.Root open={aberto} onOpenChange={aoMudarAberto}>
      <Popover.Trigger
        className={cn(estiloBotaoFerramenta, "hidden px-2.5 md:inline-flex")}
        aria-label="Atalhos de teclado"
      >
        <Keyboard className="h-4 w-4" aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" className="z-[120]">
          <Popover.Popup className={cn(estiloPopup, "w-64 p-4")}>
            <Popover.Title className="m-0 mb-3 text-sm font-semibold text-foreground">
              Atalhos de teclado
            </Popover.Title>
            <dl className="m-0 flex flex-col gap-2">
              {ATALHOS.map(([tecla, descricao]) => (
                <div
                  key={tecla}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <dt className="text-muted">{descricao}</dt>
                  <dd className="m-0">
                    <Tecla>{tecla}</Tecla>
                  </dd>
                </div>
              ))}
            </dl>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface BarraFerramentasProps {
  filtros: FiltrosLogsErro;
  consulta: string;
  totalFiltros: number;
  atualizando: boolean;
  atualizadoEm?: number;
  buscaRef: React.Ref<HTMLInputElement>;
  ajudaAberta: boolean;
  aoMudarAjuda: (aberto: boolean) => void;
  aoMudar: (mudancas: Partial<FiltrosLogsErro>) => void;
  aoAbrirFiltros: () => void;
  aoAtualizar: () => void;
  /** Estado do tempo real, ao lado do botão de atualizar. */
  indicador?: ReactNode;
  visoes: VisaoSalva[];
  aoAbrirVisao: (consulta: string) => void;
  aoSalvarVisao: (nome: string) => void;
  aoRemoverVisao: (id: string) => void;
}

export default function BarraFerramentasLogs({
  filtros,
  consulta,
  totalFiltros,
  atualizando,
  atualizadoEm,
  buscaRef,
  ajudaAberta,
  aoMudarAjuda,
  aoMudar,
  aoAbrirFiltros,
  aoAtualizar,
  indicador,
  visoes,
  aoAbrirVisao,
  aoSalvarVisao,
  aoRemoverVisao,
}: Readonly<BarraFerramentasProps>) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <CampoBusca
          ref={buscaRef}
          valor={filtros.busca}
          aoMudar={(busca) => aoMudar({ busca })}
        />
        <SeletorPeriodo filtros={filtros} aoMudar={aoMudar} />
        <button
          type="button"
          onClick={aoAbrirFiltros}
          className={cn(
            estiloBotaoFerramenta,
            totalFiltros > 0 && "border-blue-800 text-blue-800",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtros
          {totalFiltros > 0 && (
            <span className="rounded-full bg-blue-800 px-1.5 text-[11px] font-semibold tabular-nums text-white">
              {totalFiltros}
            </span>
          )}
        </button>
        <MenuVisoesSalvas
          visoes={visoes}
          consultaAtual={consulta}
          aoAbrir={aoAbrirVisao}
          aoSalvar={aoSalvarVisao}
          aoRemover={aoRemoverVisao}
        />
        {indicador}
        <button
          type="button"
          onClick={aoAtualizar}
          className={cn(estiloBotaoFerramenta, "px-2.5")}
          aria-label="Atualizar dados"
          title={
            atualizadoEm
              ? `Atualizado às ${new Date(atualizadoEm).toLocaleTimeString("pt-BR")}`
              : "Atualizar"
          }
        >
          <RefreshCw
            className={cn("h-4 w-4", atualizando && "animate-spin")}
            aria-hidden
          />
        </button>
        <AjudaAtalhos aberto={ajudaAberta} aoMudarAberto={aoMudarAjuda} />
      </div>
    </div>
  );
}
