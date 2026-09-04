"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import Premiacoes from "@/components/Premiacao/Premiacoes";
import Banner from "@/components/UI/Banner";
import Button from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";

import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { useSweetAlert } from "@/hooks/useAlert";
import { PremiacaoProvider } from "@/hooks/usePremiacao";
import { presentationApi } from "@/services/presentation";
import { cn } from "@/utils/cn";

const tabClass =
  "flex h-[2.813rem] w-[15.625rem] items-center justify-center rounded-[0.625rem] font-semibold transition hover:-translate-y-0.5 max-[1000px]:w-[40%]";

export default function Premiacao() {
  const [activeCategory, setActiveCategory] = useState<
    "banca" | "avaliadores" | "publico"
  >("banca");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const resetRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useSweetAlert();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resetRef.current && !resetRef.current.contains(e.target as Node)) {
        setResetOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeCategory = (
    categoria: "banca" | "avaliadores" | "publico",
  ) => {
    setActiveCategory(categoria);
  };

  const handleRecalculateScores = async () => {
    const eventEditionId = getEventEditionIdStorage();
    if (!eventEditionId) {
      showAlert({ icon: "error", title: "Erro", text: "Evento não encontrado" });
      return;
    }

    setIsCalculating(true);
    try {
      await presentationApi.calculateAllScores(eventEditionId);
      showAlert({
        icon: "success",
        title: "Sucesso!",
        text: "Scores recalculados com sucesso",
        timer: 2000,
      });
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showAlert({
        icon: "error",
        title: "Erro ao recalcular scores",
        text: err.response?.data?.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleResetScores = async (
    type: "evaluators" | "public" | "committee",
  ) => {
    const eventEditionId = getEventEditionIdStorage();
    if (!eventEditionId) {
      showAlert({ icon: "error", title: "Erro", text: "Evento não encontrado" });
      return;
    }

    const typeLabel =
      type === "evaluators"
        ? "da Banca"
        : type === "committee"
          ? "dos Avaliadores"
          : "do Público";

    const result = await showAlert({
      icon: "warning",
      title: "Tem certeza que deseja resetar?",
      text: `Isso irá apagar todos os scores ${typeLabel}. Esta ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: "Resetar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    setIsResetting(true);
    setResetOpen(false);
    try {
      if (type === "evaluators") {
        await presentationApi.resetEvaluatorsScores(eventEditionId);
      } else if (type === "committee") {
        await presentationApi.resetCommitteeScores(eventEditionId);
      } else {
        await presentationApi.resetPublicScores(eventEditionId);
      }

      showAlert({
        icon: "success",
        title: "Sucesso!",
        text: `Scores ${typeLabel} resetados com sucesso`,
        timer: 2000,
      });
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showAlert({
        icon: "error",
        title: "Erro ao resetar scores",
        text: err.response?.data?.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ProtectedLayout>
      <PremiacaoProvider>
        <div className="flex flex-col gap-[3.125rem]">
          <div className="flex flex-col">
            <Banner title="Premiação" />
            <div className="flex flex-wrap items-center justify-center gap-4 px-16 max-[1000px]:flex-col max-[1000px]:px-8">
              <div className="flex w-[30rem] max-[1000px]:w-full max-[1000px]:max-w-[30rem]">
                <Input
                  type="text"
                  placeholder="Pesquise pelo nome da apresentação"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none border-2 border-brand-orange focus:border-[#E68A00] focus:ring-brand-orange/25"
                />
                <button
                  type="button"
                  className="flex min-w-12 items-center justify-center rounded-r-[0.625rem] bg-brand-orange hover:bg-[#E68A00]"
                >
                  <Image
                    src="/assets/images/search.svg"
                    alt="Search icon"
                    width={24}
                    height={24}
                  />
                </button>
              </div>

              <Button
                type="button"
                className="whitespace-nowrap rounded-lg bg-brand-orange px-4 py-1.5 hover:bg-brand-orange disabled:opacity-50"
                onClick={handleRecalculateScores}
                disabled={isCalculating || isResetting}
              >
                {isCalculating ? "Recalculando..." : "Recalcular"}
              </Button>

              <div className="relative" ref={resetRef}>
                <Button
                  type="button"
                  variante="danger"
                  className="whitespace-nowrap rounded-lg px-4 py-1.5"
                  onClick={() => setResetOpen((v) => !v)}
                  disabled={isCalculating || isResetting}
                >
                  {isResetting ? "Resetando..." : "Resetar ▾"}
                </Button>
                {resetOpen && (
                  <ul className="absolute left-0 z-50 mt-1 min-w-[14rem] list-none rounded-md border border-line bg-white py-1 shadow-lg">
                    {[
                      {
                        label: "Resetar Scores da Banca",
                        type: "evaluators" as const,
                      },
                      {
                        label: "Resetar Avaliadores",
                        type: "committee" as const,
                      },
                      {
                        label: "Resetar Scores do Público",
                        type: "public" as const,
                      },
                    ].map((item) => (
                      <li key={item.type}>
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-[#019A34] hover:text-white"
                          onClick={() => handleResetScores(item.type)}
                          disabled={isResetting}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {(["banca", "avaliadores", "publico"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={cn(
                    tabClass,
                    activeCategory === cat
                      ? "border-0 bg-brand-orange text-white shadow-md hover:bg-[#E68A00]"
                      : "border-2 border-brand-orange bg-white text-brand-orange hover:bg-[#FAFAFA]",
                  )}
                  onClick={() => handleChangeCategory(cat)}
                >
                  {cat === "banca"
                    ? "Banca"
                    : cat === "avaliadores"
                      ? "Avaliadores"
                      : "Público"}
                </button>
              ))}
            </div>

            {!!activeCategory && (
              <Premiacoes categoria={activeCategory} searchValue={searchTerm} />
            )}
          </div>
        </div>
      </PremiacaoProvider>
    </ProtectedLayout>
  );
}
