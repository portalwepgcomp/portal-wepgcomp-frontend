"use client";

import PresentationCard from "@/components/CardApresentacao/PresentationCard";
import ContadorItens from "@/components/layout/ContadorItens";
import ListaVazia from "@/components/layout/ListaVazia";
import PaginaListagem from "@/components/layout/PaginaListagem";
import ToolbarListagem from "@/components/layout/ToolbarListagem";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import { useListaFavoritos } from "../hooks/useListaFavoritos";

export default function ListaFavoritos() {
  const { itens, total, isLoading, busca, setBusca, excluir } =
    useListaFavoritos();

  return (
    <PaginaListagem
      titulo="Apresentações Favoritas"
      toolbar={
        <ToolbarListagem
          busca={busca}
          onBuscaChange={setBusca}
          placeholderBusca="Pesquise pelo título da apresentação"
        />
      }
    >
      <ContadorItens
        total={total}
        rotulo={{ singular: "favorito", plural: "favoritos" }}
      />

      <div className="grid gap-4">
        {isLoading ? (
          <IndicadorDeCarregamento />
        ) : (
          <>
            {itens.map((item) => (
              <PresentationCard
                key={item.id}
                id={item.id}
                title={item.submission?.title ?? ""}
                subtitle={item.submission?.abstract ?? ""}
                name={item.submission?.mainAuthor?.name ?? ""}
                pdfFile={item.submission?.pdfFile ?? ""}
                email={item.submission?.mainAuthor?.email ?? ""}
                advisorName={item.submission?.advisor?.name ?? ""}
                onDelete={() => excluir(item.id)}
              />
            ))}
            {itens.length === 0 && <ListaVazia />}
          </>
        )}
      </div>
    </PaginaListagem>
  );
}
