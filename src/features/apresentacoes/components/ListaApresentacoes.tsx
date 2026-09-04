"use client";

import { useRouter } from "next/navigation";

import ContadorItens from "@/components/layout/ContadorItens";
import ListaVazia from "@/components/layout/ListaVazia";
import PaginaListagem from "@/components/layout/PaginaListagem";
import ToolbarListagem from "@/components/layout/ToolbarListagem";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { useListaApresentacoes } from "../hooks/useListaApresentacoes";
import type { EscopoApresentacoes } from "../types";
import CardApresentacaoLista from "./CardApresentacaoLista";

interface ConfigCriacao {
  rotulo: string;
  /** "modal" abre o modal de cadastro; "rota" navega para `href`. */
  modo: "modal" | "rota";
  href?: string;
}

interface ListaApresentacoesProps {
  titulo: string;
  escopo?: EscopoApresentacoes;
  ocultarBusca?: boolean;
  placeholderBusca?: string;
  criacao?: ConfigCriacao;
}

/**
 * Composição da tela de apresentações: shell de layout + toolbar + lista de
 * cards. Usa o hook da feature; a página apenas informa título/escopo/criação.
 */
export default function ListaApresentacoes({
  titulo,
  escopo = "todas",
  ocultarBusca,
  placeholderBusca = "Pesquise pelo nome da apresentação",
  criacao,
}: Readonly<ListaApresentacoesProps>) {
  const router = useRouter();
  const {
    itens,
    total,
    isLoading,
    busca,
    setBusca,
    edicaoAtiva,
    criarDesabilitado,
    abrirCriacao,
    abrirEdicao,
    excluir,
  } = useListaApresentacoes({ escopo });

  const criar =
    criacao && edicaoAtiva
      ? {
          rotulo: criacao.rotulo,
          desabilitado: criarDesabilitado,
          onClick: () => {
            if (criacao.modo === "rota" && criacao.href) {
              router.push(criacao.href);
            } else {
              abrirCriacao();
            }
          },
        }
      : undefined;

  return (
    <PaginaListagem
      titulo={titulo}
      toolbar={
        <ToolbarListagem
          busca={busca}
          onBuscaChange={setBusca}
          ocultarBusca={ocultarBusca}
          placeholderBusca={placeholderBusca}
          criar={criar}
        />
      }
    >
      <ContadorItens
        total={total}
        rotulo={{
          singular: "apresentação cadastrada",
          plural: "apresentações cadastradas",
        }}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <IndicadorDeCarregamento />
        ) : (
          <>
            {itens.map((item) => (
              <CardApresentacaoLista
                key={item.id}
                item={item}
                edicaoAtiva={edicaoAtiva}
                onEditar={() => abrirEdicao(item.id)}
                onExcluir={() => excluir(item.id)}
              />
            ))}
            {itens.length === 0 && <ListaVazia />}
          </>
        )}
      </div>
    </PaginaListagem>
  );
}
