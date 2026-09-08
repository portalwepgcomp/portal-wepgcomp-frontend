import { useEffect, useState } from "react";
import Image from "next/image";
import {
  PremiacaoCategoriaProps,
  Premiacoes,
  AuthorOrEvaluator,
} from "@/models/premiacao";

export default function Premiacao({
  categoria,
  premiacoes,
  avaliadores,
  searchValue,
}: PremiacaoCategoriaProps) {
  const [premiacoesValues, setPremiacoesValues] = useState<Premiacoes[]>();
  const [premiacoesValuesAvaliadores, setPremiacoesValuesAvaliadores] =
    useState<AuthorOrEvaluator[]>();

  useEffect(() => {
    if (categoria == "banca" || categoria == "publico") {
      const newPremiacoesValues =
        premiacoes?.filter(
          (v) =>
            !v.submission.title ||
            v.submission.title
              ?.toLowerCase()
              .includes(searchValue.trim().toLowerCase()),
        ) ?? [];
      setPremiacoesValues(newPremiacoesValues);
    } else {
      const newPremiacoesValuesAvaliadores =
        avaliadores
          ?.filter(
            (v) =>
              !v.name ||
              v.name?.toLowerCase().includes(searchValue.trim().toLowerCase()),
          )
          .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)) ?? [];
      setPremiacoesValuesAvaliadores(newPremiacoesValuesAvaliadores);
    }
  }, [categoria, premiacoes, searchValue, avaliadores]);

  const emptyState = (
    <div className="flex items-center justify-center p-3">
      <h4 className="mb-0 flex items-center gap-3 text-[#555555]">
        <Image src="/assets/images/empty_box.svg" alt="Lista vazia" width={90} height={90} />
        Essa lista ainda está vazia
      </h4>
    </div>
  );

  const cardClass =
    "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md";

  return (
    <div className="mb-5 grid gap-3">
      <div className="flex flex-col gap-3">
        {premiacoes.length === 0 && categoria !== "avaliadores"
          ? emptyState
          : categoria === "avaliadores" &&
              premiacoesValuesAvaliadores !== undefined &&
              premiacoesValuesAvaliadores.length === 0
            ? emptyState
            : premiacoes.length === 0 &&
                categoria === "avaliadores" &&
                premiacoesValuesAvaliadores !== undefined
              ? premiacoesValuesAvaliadores.map((item, index) => (
                  <div key={index} className={cardClass}>
                    <div className="flex">
                      <div className="me-3 min-w-[30px] text-3xl font-bold text-black">
                        {index + 1}º
                      </div>
                      <div className="text-black">
                        <h6
                          className={`font-semibold text-black ${!item.name ? "mb-0" : ""}`}
                        >
                          {item.name}
                        </h6>
                        {item.email && (
                          <h6 className="mb-0 text-black">{item.email}</h6>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col text-center">
                      <p className="m-0">Votos</p>
                      <p className="mb-0 font-bold text-black">{item.votes}</p>
                    </div>
                  </div>
                ))
              : premiacoesValues !== undefined
                ? premiacoesValues.map((item, index) => (
                    <div key={index} className={cardClass}>
                      <div className="flex flex-grow items-center gap-3">
                        <div className="flex min-w-[50px] items-center justify-center">
                          <h3 className="mb-0 font-bold text-brand-navy">
                            {index + 1}º
                          </h3>
                        </div>
                        <div className="flex-grow text-black">
                          <h6
                            className={`font-semibold text-black ${!item.submission.mainAuthor.name ? "mb-0" : ""}`}
                          >
                            {item.submission.title}
                          </h6>
                          {item.submission.mainAuthor.name && (
                            <h6 className="mb-0 text-black">
                              {item.submission.mainAuthor.name}
                            </h6>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        <h4 className="mb-0 font-bold text-black">
                          {categoria === "banca"
                            ? item.evaluatorsAverageScore?.toFixed(2)
                            : categoria === "publico"
                              ? item.publicAverageScore?.toFixed(2)
                              : ""}
                        </h4>
                      </div>
                    </div>
                  ))
                : (
                    <div className="me-5 mt-4 flex items-center justify-center p-3">
                      {emptyState}
                    </div>
                  )}
      </div>
    </div>
  );
}
