"use client";

import OrientacoesAudiencia from "@/components/Orientacoes/OrientacoesAudiencia";
import OrientacoesAutores from "@/components/Orientacoes/OrientacoesAutores";
import OrientacoesAvaliadores from "@/components/Orientacoes/OrientacoesAvaliadores";
import Banner from "@/components/UI/Banner";
import { useOrientacao } from "@/hooks/useOrientacao";
import Button from "@/components/UI/Button";
import { useEffect, useState } from "react";

const abas = [
  { id: 0, label: "Autores" },
  { id: 1, label: "Avaliadores" },
  { id: 2, label: "Audiência" },
] as const;


export default function Orientacoes() {
  const [secao, definirSecao] = useState<number>(0);
  const { getOrientacoes } = useOrientacao();

  useEffect(() => {
    getOrientacoes();
  }, [getOrientacoes]);

  return (
    <div className="w-full">
      <Banner title="Orientações" />
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {abas.map((aba) => (
            <Button size="lg"
              key={aba.id}
              variante={secao === aba.id ? "secondary" : "outline"}
              aria-pressed={secao === aba.id}
              onClick={() => definirSecao(aba.id)}
            >
              {aba.label}
            </Button>
          ))}
        </div>
        <div>
          {secao === 0 && <OrientacoesAutores />}
          {secao === 1 && <OrientacoesAvaliadores />}
          {secao === 2 && <OrientacoesAudiencia />}
        </div>
      </div>
    </div>
  );
}
