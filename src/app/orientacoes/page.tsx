"use client";

import OrientacoesAudiencia from "@/components/Orientacoes/OrientacoesAudiencia";
import OrientacoesAutores from "@/components/Orientacoes/OrientacoesAutores";
import OrientacoesAvaliadores from "@/components/Orientacoes/OrientacoesAvaliadores";
import Banner from "@/components/UI/Banner";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useOrientacao } from "@/hooks/useOrientacao";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

const tabs = [
  { id: 0, label: "Autores" },
  { id: 1, label: "Avaliadores" },
  { id: 2, label: "Audiência" },
] as const;

const tabBase =
  "flex w-[190px] cursor-pointer items-center justify-center rounded-lg border-2 border-brand-orange py-2.5 text-xl font-semibold tracking-wide shadow-sm transition duration-250 max-md:w-40 max-md:text-lg max-[660px]:w-full";

export default function Orientacoes() {
  const [setion, setSetion] = useState<number>(0);
  const { postOrientacao, getOrientacoes, orientacoes } = useOrientacao();

  useEffect(() => {
    getOrientacoes();
  }, []);

  useEffect(() => {
    if (orientacoes === undefined) {
      const eventEditionId = getEventEditionIdStorage();
      postOrientacao({
        eventEditionId: eventEditionId ?? "",
        summary: "Sumário criado",
      });
    }
  }, [orientacoes]);

  return (
    <div className="flex flex-col gap-[50px]">
      <Banner title="Orientações" />
      <div className="mb-6 flex flex-wrap items-center justify-center gap-5 max-md:gap-4 max-[660px]:flex-col">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              tabBase,
              setion === tab.id
                ? "bg-brand-orange text-white hover:-translate-y-0.5 hover:bg-[#ffb733] hover:shadow-md active:translate-y-0 active:shadow-sm"
                : "bg-white text-brand-orange hover:-translate-y-0.5 hover:bg-[#fff6e5] hover:shadow-md active:translate-y-0 active:shadow-sm",
            )}
            onClick={() => setSetion(tab.id)}
            onKeyDown={(e) => e.key === "Enter" && setSetion(tab.id)}
            role="button"
            tabIndex={0}
          >
            {tab.label}
          </div>
        ))}
      </div>
      {setion === 0 && <OrientacoesAutores />}
      {setion === 1 && <OrientacoesAvaliadores />}
      {setion === 2 && <OrientacoesAudiencia />}
    </div>
  );
}
