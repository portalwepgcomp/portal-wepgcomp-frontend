"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEdicao } from "@/hooks/useEdicao";
import { cn } from "@/utils/cn";
import { formatDateEvent, formatDateUniq } from "@/utils/formatDate";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CarouselSlide from "./CarouselSlide";

const INTERVAL_MS = 6000;
const SLIDE_COUNT = 3;

const slide1 = {
  backgroundUrl: "/assets/images/slide1.png",
  labelButton: "Confira a programação",
};

const slide2 = {
  backgroundUrl: "/assets/images/slide2.png",
  title: "SOBRE",
  concept_subtitles: ["CONCEITO", "5", "CAPES"],
  subtitles: [
    "Workshop de Estudantes da Pós-Graduação em Ciência da Computação (WEPGCOMP) da Universidade Federal da Bahia (UFBA). O objetivo do evento é apresentar as pesquisas em andamento realizadas pelos alunos de doutorado (a partir do segundo ano), bem como propiciar um ambiente de troca de conhecimento e integração entre a comunidade.",
  ],
};

const slide3 = {
  backgroundUrl: "/assets/images/slide3.png",
  title: "DATAS IMPORTANTES",
  labelButton: "INSCREVA-SE JÁ!",
};

const botaoOutline =
  "mt-3 inline-block rounded-[20px] border-2 border-white px-4 py-2 text-base font-semibold text-white transition hover:bg-white/10 max-[760px]:text-base";

const titulo =
  "text-center text-[70px] font-extrabold max-xl:text-[2.75rem] max-[760px]:text-[1.6rem]";

const paragrafo =
  "w-full text-center text-[22px] max-[760px]:text-base max-[480px]:text-left";

export default function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { Edicao } = useEdicao();
  const { signed } = useAuth();

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="carousel-wepgcomp"
      className="relative mb-10 min-h-[300px] max-[700px]:min-h-[250px] max-[480px]:min-h-[180px]"
    >
      <CarouselSlide
        imageUrl={slide1.backgroundUrl}
        isActive={activeIndex === 0}
      >
        <h2 className={cn(titulo, "text-white")}>
          {Edicao?.name || "Carregando..."}
        </h2>
        <p className={paragrafo}>{Edicao?.description || "Carregando..."}</p>
        <p className={cn(paragrafo, "font-semibold")}>
          {Edicao?.startDate
            ? formatDateEvent(Edicao?.startDate, Edicao?.endDate)
            : "Carregando..."}
        </p>
        <Link className={cn(botaoOutline, "text-xl")} href="#Programacao">
          {slide1.labelButton}
        </Link>
      </CarouselSlide>

      <CarouselSlide
        imageUrl={slide2.backgroundUrl}
        isActive={activeIndex === 1}
      >
        <h2 className={titulo}>{slide2.title}</h2>
        <div className="flex max-w-[70%] max-[480px]:max-w-full max-[1024px]:flex-col max-[760px]:flex-col">
          <div className="mt-[-75px] flex flex-col items-center max-[1024px]:hidden max-[480px]:mt-0">
            <p className={cn(paragrafo, "mb-10 font-semibold")}>
              {slide2.concept_subtitles[0]}
            </p>
            <p className="text-[8rem] font-black leading-[3rem]">
              {slide2.concept_subtitles[1]}
            </p>
            <p className={cn(paragrafo, "mt-2 text-2xl font-semibold")}>
              {slide2.concept_subtitles[2]}
            </p>
          </div>
          <div className="ml-12 flex flex-col max-[480px]:ml-0">
            <p className={cn(paragrafo, "text-justify max-[480px]:text-left")}>
              {slide2.subtitles[0]}
            </p>
          </div>
        </div>
      </CarouselSlide>

      <CarouselSlide
        imageUrl={slide3.backgroundUrl}
        isActive={activeIndex === 2}
      >
        <h2 className={titulo}>{slide3.title}</h2>
        <p className={paragrafo}>
          Inscrições: até {formatDateUniq(Edicao?.startDate)}
        </p>
        <p className={paragrafo}>
          Data do evento:{" "}
          {formatDateEvent(Edicao?.startDate, Edicao?.endDate)}
        </p>
        <p className={paragrafo}>
          Data limite para submissão:{" "}
          {formatDateUniq(Edicao?.submissionDeadline)}
        </p>
        {!signed && (
          <Link className={botaoOutline} href="/cadastro">
            {slide3.labelButton}
          </Link>
        )}
      </CarouselSlide>

      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className={cn(
              "h-[15px] w-[15px] rounded-full border-0 transition",
              activeIndex === i ? "bg-white" : "bg-white/50 hover:bg-white/70",
            )}
            aria-label={`Slide ${i + 1}`}
            aria-current={activeIndex === i ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
