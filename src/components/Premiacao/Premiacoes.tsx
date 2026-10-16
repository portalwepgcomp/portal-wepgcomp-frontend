import { useEffect } from "react";
import PremiacaoCategoria from "./PremiacaoCategoria";
import { usePremiacao } from "@/hooks/usePremiacao";
import { useEdicao } from "@/hooks/useEdicao";

export default function Premiacoes({
  categoria,
  searchValue,
}: Readonly<{
  categoria: "banca" | "avaliadores" | "publico";
  searchValue: string;
}>) {
  const { Edicao } = useEdicao();
  const {
    premiacaoListBanca,
    premiacaoListAudiencia,
    premiacaoListAvaliadores,
    getPremiacoesBanca,
    getPremiacoesAudiencia,
    getPremiacoesAvaliadores,
  } = usePremiacao();

  useEffect(() => {
    const eventEditionId = Edicao?.id;
    if (!eventEditionId) return;

    switch (categoria) {
      case "banca":
        getPremiacoesBanca(eventEditionId);
        break;
      case "publico":
        getPremiacoesAudiencia(eventEditionId);
        break;
      case "avaliadores":
        getPremiacoesAvaliadores(eventEditionId);
        break;
      default:
        break;
    }
  }, [
    categoria,
    Edicao?.id,
    getPremiacoesAudiencia,
    getPremiacoesAvaliadores,
    getPremiacoesBanca,
  ]);

  const getAwards = () => {
    switch (categoria) {
      case "banca":
        return premiacaoListBanca;
      case "publico":
        return premiacaoListAudiencia;
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col px-16 py-16 max-[1000px]:p-5">
      <PremiacaoCategoria
        categoria={categoria}
        premiacoes={getAwards()}
        searchValue={searchValue}
        avaliadores={premiacaoListAvaliadores}
      />
    </div>
  );
}
