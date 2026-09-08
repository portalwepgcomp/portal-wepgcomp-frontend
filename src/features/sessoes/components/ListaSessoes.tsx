"use client";

import ContadorItens from "@/components/layout/ContadorItens";
import ListaVazia from "@/components/layout/ListaVazia";
import PaginaListagem from "@/components/layout/PaginaListagem";
import ToolbarListagem from "@/components/layout/ToolbarListagem";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { useListaSessoes } from "../hooks/useListaSessoes";
import CardSessao from "./CardSessao";

export default function ListaSessoes() {
  const {
    itens,
    total,
    isLoading,
    busca,
    setBusca,
    edicaoAtiva,
    abrirCriacao,
    abrirEdicao,
    abrirReordenar,
    excluir,
  } = useListaSessoes();

  const criar = edicaoAtiva
    ? { rotulo: "Incluir Sessão", onClick: abrirCriacao }
    : undefined;

  return (
    <PaginaListagem
      titulo="Sessões"
      toolbar={
        <ToolbarListagem
          busca={busca}
          onBuscaChange={setBusca}
          placeholderBusca="Pesquise pelo nome da sessão"
          criar={criar}
        />
      }
    >
      <ContadorItens
        total={total}
        rotulo={{ singular: "sessão cadastrada", plural: "sessões cadastradas" }}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <IndicadorDeCarregamento />
        ) : (
          <>
            {itens.map((sessao) => (
              <CardSessao
                key={sessao.id}
                sessao={sessao}
                edicaoAtiva={edicaoAtiva}
                onEditar={() => abrirEdicao(sessao.id)}
                onExcluir={() => excluir(sessao.id)}
                onReordenar={() => abrirReordenar(sessao.id)}
              />
            ))}
            {itens.length === 0 && <ListaVazia />}
          </>
        )}
      </div>
    </PaginaListagem>
  );
}
