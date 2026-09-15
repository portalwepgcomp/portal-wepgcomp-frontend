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
  concept_subtitles: ["CONCEITO", "6", "CAPES"],
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
  "mt-4 inline-block rounded-full border-2 border-white px-6 py-2.5 text-sm md:text-base font-semibold text-white transition hover:bg-white/15 active:scale-95 shadow-md";

const titulo =
  "text-center text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-md";

const paragrafo =
  "w-full text-center text-sm md:text-lg lg:text-xl text-white/95 max-w-3xl leading-relaxed";

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
      className="relative mb-10 min-h-[460px] md:min-h-[500px] w-full overflow-hidden"
    >
      <CarouselSlide
        imageUrl={slide1.backgroundUrl}
        isActive={activeIndex === 0}
      >
        <h2 className={titulo}>
          {Edicao?.name || "WEPGCOMP"}
        </h2>
        <p className={paragrafo}>
          {Edicao?.description || "Workshop de Estudantes da Pós-Graduação em Ciência da Computação"}
        </p>
        <p className={cn(paragrafo, "font-semibold text-amber-300")}>
          {Edicao?.startDate
            ? formatDateEvent(Edicao?.startDate, Edicao?.endDate)
            : "Data a definir"}
        </p>
        <Link className={botaoOutline} href="#Programacao">
          {slide1.labelButton}
        </Link>
      </CarouselSlide>

      <CarouselSlide
        imageUrl={slide2.backgroundUrl}
        isActive={activeIndex === 1}
      >
        <h2 className={titulo}>{slide2.title}</h2>
        <div className="flex w-full max-w-4xl flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mt-2">
          <div className="flex flex-col items-center justify-center shrink-0 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-amber-300">
              {slide2.concept_subtitles[0]}
            </span>
            <span className="text-4xl md:text-6xl font-black my-1 text-white">
              {slide2.concept_subtitles[1]}
            </span>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-amber-300">
              {slide2.concept_subtitles[2]}
            </span>
          </div>
          <div className="flex flex-col text-left md:text-justify">
            <p className="text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
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
        <div className="flex flex-col items-center gap-2 my-2">
          <p className={paragrafo}>
            <span className="font-semibold text-amber-300">Inscrições:</span> até {formatDateUniq(Edicao?.startDate)}
          </p>
          <p className={paragrafo}>
            <span className="font-semibold text-amber-300">Data do evento:</span>{" "}
            {formatDateEvent(Edicao?.startDate, Edicao?.endDate)}
          </p>
          <p className={paragrafo}>
            <span className="font-semibold text-amber-300">Data limite para submissão:</span>{" "}
            {formatDateUniq(Edicao?.submissionDeadline)}
          </p>
        </div>
        {!signed && (
          <Link className={botaoOutline} href="/cadastro">
            {slide3.labelButton}
          </Link>
        )}
      </CarouselSlide>

      <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2.5">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className={cn(
              "h-3 w-3 rounded-full border-0 transition-all duration-300",
              activeIndex === i
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/80",
            )}
            aria-label={`Slide ${i + 1}`}
            aria-current={activeIndex === i ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
