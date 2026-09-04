"use client";

import PresentationCard from "@/components/CardApresentacao/PresentationCard";
import ListaVazia from "@/components/layout/ListaVazia";
import Banner from "@/components/UI/Banner";
import { useListaBancas } from "../hooks/useListaBancas";

export default function ListaBancas() {
  const { sessoes, vazio } = useListaBancas();

  return (
    <div className="flex flex-col gap-5">
      <Banner title="Minhas bancas" />
      <div className="mx-[200px] mb-[100px] max-xl:mx-[100px] max-xl:mb-[50px] max-md:mx-[50px] max-md:mb-6 max-[480px]:mx-5 max-[480px]:mb-2.5">
        <p className="text-justify">
          Esta página exibe as bancas pelas quais você, como professor avaliador,
          é responsável. As apresentações estão organizadas por sessão, e cada
          sessão é destacada com uma cor distinta para facilitar a identificação.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {sessoes.map((sessao) =>
            [...(sessao.presentations ?? [])]
              .sort((a, b) => a.positionWithinBlock - b.positionWithinBlock)
              .map((pres) => (
                <PresentationCard
                  key={pres.id}
                  id={pres.id}
                  title={pres?.submission?.title ?? ""}
                  subtitle={pres?.submission?.abstract ?? ""}
                  name={pres?.submission?.mainAuthor?.name ?? ""}
                  pdfFile={pres?.submission?.pdfFile ?? ""}
                  email={pres?.submission?.mainAuthor?.email ?? ""}
                  advisorName={pres?.submission?.advisor?.name ?? ""}
                  presentationData={pres?.startTime ?? ""}
                />
              )),
          )}
        </div>

        {vazio && <ListaVazia />}
      </div>
    </div>
  );
}
