"use client";

import { useEffect, useState, type ReactNode } from "react";
import Button from "@/components/UI/Button";
import PainelLateral from "@/components/UI/PainelLateral";
import { Input } from "@/components/UI/Input";
import { cn } from "@/utils/cn";
import type {
  ClasseStatus,
  FiltrosLogsErro,
  MetodoHttp,
  NivelLog,
  OrigemLog,
} from "../tipos";
import { alternarValor, limparFiltros } from "../lib/filtrosUrl";
import {
  ROTULO_NIVEL,
  ROTULO_NIVEL_USUARIO,
  ROTULO_ORIGEM,
  ROTULO_PERFIL,
} from "../lib/formatacao";

const paraLista = (texto: string) =>
  texto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function Secao({
  titulo,
  children,
}: Readonly<{ titulo: string; children: ReactNode }>) {
  return (
    <fieldset className="m-0 flex flex-col gap-4 border-0 border-b border-line p-0 pb-5 last:border-b-0">
      <legend className="mb-3 p-0 text-xs font-semibold uppercase tracking-wider text-brand-slate">
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

function CampoTexto({
  id,
  rotulo,
  dica,
  valor,
  aoMudar,
  placeholder,
  mono,
}: Readonly<{
  id: string;
  rotulo: string;
  dica?: string;
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  mono?: boolean;
}>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {rotulo}
      </label>
      <Input
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        className={cn(mono && "font-mono text-[13px]")}
        autoComplete="off"
        spellCheck={false}
      />
      {dica && <span className="text-xs text-muted">{dica}</span>}
    </div>
  );
}

function GrupoOpcoes<T extends string>({
  rotulo,
  opcoes,
  selecionados,
  aoAlternar,
}: Readonly<{
  rotulo: string;
  opcoes: { valor: T; rotulo: string }[];
  selecionados: T[];
  aoAlternar: (valor: T) => void;
}>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{rotulo}</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={rotulo}>
        {opcoes.map((opcao) => {
          const ativo = selecionados.includes(opcao.valor);
          return (
            <button
              key={opcao.valor}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoAlternar(opcao.valor)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50",
                ativo
                  ? "border-blue-800 bg-blue-800 text-white"
                  : "border-gray-300 bg-white text-foreground hover:bg-muted-light",
              )}
            >
              {opcao.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const opcoesDe = <T extends string>(mapa: Record<T, string>) =>
  (Object.entries(mapa) as [T, string][]).map(([valor, rotulo]) => ({
    valor,
    rotulo,
  }));

interface Rascunho {
  filtros: FiltrosLogsErro;
  status: string;
  excecao: string;
  prisma: string;
  contexto: string;
}

const rascunhoDe = (filtros: FiltrosLogsErro): Rascunho => ({
  filtros,
  status: filtros.status.join(", "),
  excecao: filtros.excecao.join(", "),
  prisma: filtros.prisma.join(", "),
  contexto: filtros.contexto.join(", "),
});

interface FiltrosAvancadosProps {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  filtros: FiltrosLogsErro;
  aoAplicar: (filtros: FiltrosLogsErro) => void;
}

/** Edita um rascunho e só aplica no fim — evita uma busca por tecla digitada. */
export default function FiltrosAvancados({
  aberto,
  aoMudarAberto,
  filtros,
  aoAplicar,
}: Readonly<FiltrosAvancadosProps>) {
  const [rascunho, setRascunho] = useState(() => rascunhoDe(filtros));

  useEffect(() => {
    if (aberto) setRascunho(rascunhoDe(filtros));
  }, [aberto, filtros]);

  const f = rascunho.filtros;
  const mudar = (mudancas: Partial<FiltrosLogsErro>) =>
    setRascunho((atual) => ({
      ...atual,
      filtros: { ...atual.filtros, ...mudancas },
    }));
  const mudarTexto = (
    chave: "status" | "excecao" | "prisma" | "contexto",
    valor: string,
  ) => setRascunho((atual) => ({ ...atual, [chave]: valor }));
  const opcional = (valor: string) => valor.trim() || undefined;

  const aplicar = () => {
    aoAplicar({
      ...f,
      status: paraLista(rascunho.status)
        .map(Number)
        .filter(
          (codigo) =>
            Number.isInteger(codigo) && codigo >= 100 && codigo <= 599,
        ),
      excecao: paraLista(rascunho.excecao),
      prisma: paraLista(rascunho.prisma).map((codigo) => codigo.toUpperCase()),
      contexto: paraLista(rascunho.contexto),
    });
    aoMudarAberto(false);
  };

  return (
    <PainelLateral
      aberto={aberto}
      aoMudar={aoMudarAberto}
      largura="md"
      titulo="Filtros"
      descricao="Combine critérios; todos precisam ser verdadeiros ao mesmo tempo."
      rodape={
        <div className="flex items-center justify-between gap-2">
          <Button
            variante="ghost"
            size="sm"
            onClick={() => setRascunho(rascunhoDe(limparFiltros(f)))}
          >
            Limpar
          </Button>
          <Button variante="primary" size="sm" onClick={aplicar}>
            Aplicar filtros
          </Button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-5 px-5 py-5 sm:px-6"
        onSubmit={(evento) => {
          evento.preventDefault();
          aplicar();
        }}
      >
        <Secao titulo="Usuário">
          <CampoTexto
            id="filtro-email"
            rotulo="E-mail contém"
            valor={f.usuario ?? ""}
            aoMudar={(valor) => mudar({ usuario: opcional(valor) })}
            placeholder="ex.: @ufba.br"
          />
          <CampoTexto
            id="filtro-nome"
            rotulo="Nome contém"
            valor={f.nomeUsuario ?? ""}
            aoMudar={(valor) => mudar({ nomeUsuario: opcional(valor) })}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Autenticado
            </span>
            <div
              className="flex gap-1.5"
              role="radiogroup"
              aria-label="Autenticado"
            >
              {[
                { valor: undefined, rotulo: "Todos" },
                { valor: true, rotulo: "Sim" },
                { valor: false, rotulo: "Não" },
              ].map((opcao) => {
                const ativo = f.autenticado === opcao.valor;
                return (
                  <button
                    key={opcao.rotulo}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    onClick={() => mudar({ autenticado: opcao.valor })}
                    className={cn(
                      "rounded-md border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/50",
                      ativo
                        ? "border-blue-800 bg-blue-800 text-white"
                        : "border-gray-300 bg-white text-foreground hover:bg-muted-light",
                    )}
                  >
                    {opcao.rotulo}
                  </button>
                );
              })}
            </div>
          </div>
          <GrupoOpcoes
            rotulo="Nível de acesso"
            opcoes={opcoesDe(ROTULO_NIVEL_USUARIO)}
            selecionados={f.nivelUsuario}
            aoAlternar={(valor) =>
              mudar({ nivelUsuario: alternarValor(f.nivelUsuario, valor) })
            }
          />
          <GrupoOpcoes
            rotulo="Perfil"
            opcoes={opcoesDe(ROTULO_PERFIL)}
            selecionados={f.perfil}
            aoAlternar={(valor) =>
              mudar({ perfil: alternarValor(f.perfil, valor) })
            }
          />
          <CampoTexto
            id="filtro-id-usuario"
            rotulo="ID do usuário"
            valor={f.idUsuario ?? ""}
            aoMudar={(valor) => mudar({ idUsuario: opcional(valor) })}
            mono
          />
        </Secao>

        <Secao titulo="Falha">
          <GrupoOpcoes<ClasseStatus>
            rotulo="Classe de status"
            opcoes={[
              { valor: "5xx", rotulo: "5xx · servidor" },
              { valor: "4xx", rotulo: "4xx · cliente" },
            ]}
            selecionados={f.classe}
            aoAlternar={(valor) =>
              mudar({ classe: alternarValor(f.classe, valor) })
            }
          />
          <CampoTexto
            id="filtro-status"
            rotulo="Códigos de status"
            dica="Separe por vírgula: 500, 502"
            valor={rascunho.status}
            aoMudar={(valor) => mudarTexto("status", valor)}
            mono
          />
          <GrupoOpcoes<OrigemLog>
            rotulo="Origem"
            opcoes={opcoesDe(ROTULO_ORIGEM)}
            selecionados={f.origem}
            aoAlternar={(valor) =>
              mudar({ origem: alternarValor(f.origem, valor) })
            }
          />
          <GrupoOpcoes<NivelLog>
            rotulo="Nível"
            opcoes={opcoesDe(ROTULO_NIVEL)}
            selecionados={f.nivel}
            aoAlternar={(valor) =>
              mudar({ nivel: alternarValor(f.nivel, valor) })
            }
          />
          <CampoTexto
            id="filtro-mensagem"
            rotulo="Mensagem contém"
            valor={f.mensagem ?? ""}
            aoMudar={(valor) => mudar({ mensagem: opcional(valor) })}
          />
          <CampoTexto
            id="filtro-excecao"
            rotulo="Exceção"
            dica="Nome exato, separado por vírgula"
            valor={rascunho.excecao}
            aoMudar={(valor) => mudarTexto("excecao", valor)}
            placeholder="PrismaClientKnownRequestError"
            mono
          />
          <CampoTexto
            id="filtro-prisma"
            rotulo="Código Prisma"
            valor={rascunho.prisma}
            aoMudar={(valor) => mudarTexto("prisma", valor)}
            placeholder="P2002, P2025"
            mono
          />
        </Secao>

        <Secao titulo="Onde ocorreu">
          <GrupoOpcoes<MetodoHttp>
            rotulo="Método HTTP"
            opcoes={(
              ["GET", "POST", "PUT", "PATCH", "DELETE"] as MetodoHttp[]
            ).map((m) => ({
              valor: m,
              rotulo: m,
            }))}
            selecionados={f.metodo}
            aoAlternar={(valor) =>
              mudar({ metodo: alternarValor(f.metodo, valor) })
            }
          />
          <CampoTexto
            id="filtro-rota"
            rotulo="Rota (exata)"
            valor={f.rota ?? ""}
            aoMudar={(valor) => mudar({ rota: opcional(valor) })}
            placeholder="/submission/:id"
            mono
          />
          <CampoTexto
            id="filtro-caminho"
            rotulo="Caminho contém"
            valor={f.caminho ?? ""}
            aoMudar={(valor) => mudar({ caminho: opcional(valor) })}
            placeholder="/certificate"
            mono
          />
          <CampoTexto
            id="filtro-arquivo"
            rotulo="Arquivo contém"
            valor={f.arquivo ?? ""}
            aoMudar={(valor) => mudar({ arquivo: opcional(valor) })}
            placeholder="user.service"
            mono
          />
          <CampoTexto
            id="filtro-contexto"
            rotulo="Contexto do logger"
            valor={rascunho.contexto}
            aoMudar={(valor) => mudarTexto("contexto", valor)}
            placeholder="MailingService, Scheduler"
            mono
          />
          <CampoTexto
            id="filtro-requisicao"
            rotulo="Request ID"
            dica="O mesmo valor do cabeçalho X-Request-Id"
            valor={f.requisicao ?? ""}
            aoMudar={(valor) => mudar({ requisicao: opcional(valor) })}
            mono
          />
        </Secao>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </PainelLateral>
  );
}
