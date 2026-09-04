"use client";

import OrientacoesAudiencia from "@/components/Orientacoes/OrientacoesAudiencia";
import OrientacoesAutores from "@/components/Orientacoes/OrientacoesAutores";
import OrientacoesAvaliadores from "@/components/Orientacoes/OrientacoesAvaliadores";
import Banner from "@/components/UI/Banner";
import { useOrientacao } from "@/hooks/useOrientacao";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

const tabs = [
  { id: 0, label: "Autores" },
  { id: 1, label: "Avaliadores" },
  { id: 2, label: "Audiência" },
] as const;

const tabBase =
  "flex w-36 sm:w-44 cursor-pointer items-center justify-center rounded-xl border-2 border-brand-orange py-2 text-sm sm:text-base font-semibold tracking-wide shadow-sm transition duration-200";

export default function Orientacoes() {
  const [setion, setSetion] = useState<number>(0);
  const { getOrientacoes } = useOrientacao();

  useEffect(() => {
    getOrientacoes();
  }, [getOrientacoes]);

  return (
    <div className="w-full">
      <Banner title="Orientações" />
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                tabBase,
                setion === tab.id
                  ? "bg-brand-orange text-white shadow-sm"
                  : "bg-white text-brand-orange hover:bg-orange-50",
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
        <div>
          {setion === 0 && <OrientacoesAutores />}
          {setion === 1 && <OrientacoesAvaliadores />}
          {setion === 2 && <OrientacoesAudiencia />}
        </div>
      </div>
    </div>
  );
}
