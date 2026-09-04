"use client";

import { useRouter } from "next/navigation";

import ContadorItens from "@/components/layout/ContadorItens";
import ListaVazia from "@/components/layout/ListaVazia";
import PaginaListagem from "@/components/layout/PaginaListagem";
import ToolbarListagem from "@/components/layout/ToolbarListagem";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import ModalEditarEdicao from "@/components/Modals/ModalEditarEdicao/Modal EditarEdição";
import { useListaEdicoes } from "../hooks/useListaEdicoes";
import CardEdicao from "./CardEdicao";

export default function ListaEdicoes() {
  const router = useRouter();
  const {
    itens,
    total,
    isLoading,
    busca,
    setBusca,
    edicaoAtiva,
    edicaoSelecionada,
    abrirEdicao,
    excluir,
  } = useListaEdicoes();

  const criar = edicaoAtiva
    ? { rotulo: "Cadastrar Edição", onClick: () => router.push("/cadastro-edicao") }
    : undefined;

  return (
    <>
      <PaginaListagem
        titulo="Edições do Evento"
        toolbar={
          <ToolbarListagem
            busca={busca}
            onBuscaChange={setBusca}
            placeholderBusca="Pesquise por edição"
            criar={criar}
          />
        }
      >
        <ContadorItens
          total={total}
          rotulo={{
            singular: "edição cadastrada",
            plural: "edições cadastradas",
          }}
        />

        <div className="grid gap-4">
          {isLoading ? (
            <IndicadorDeCarregamento />
          ) : (
            <>
              {itens.map((edicao) => (
                <CardEdicao
                  key={edicao.id}
                  edicao={edicao}
                  edicaoAtiva={edicaoAtiva}
                  onEditar={() => abrirEdicao(edicao.id)}
                  onExcluir={() => excluir(edicao.id)}
                />
              ))}
              {itens.length === 0 && <ListaVazia />}
            </>
          )}
        </div>
      </PaginaListagem>

      <ModalEditarEdicao edicaoData={edicaoSelecionada} />
    </>
  );
}
