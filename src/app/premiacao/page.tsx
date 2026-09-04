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
  "flex h-10 px-5 items-center justify-center rounded-xl text-sm font-semibold transition cursor-pointer max-sm:w-full";

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

  const handleChangeCategory = (cat: "banca" | "avaliadores" | "publico") => {
    setActiveCategory(cat);
  };

  const handleRecalculateScores = async () => {
    const eventEditionId = getEventEditionIdStorage();
    if (!eventEditionId) {
      showAlert({
        icon: "warning",
        title: "Edição não selecionada",
        text: "Selecione uma edição do evento para recalcular as notas.",
      });
      return;
    }

    const res = await showAlert({
      icon: "warning",
      title: "Recalcular Notas?",
      text: "Isso irá recalcular todas as notas ponderadas (Banca, Avaliadores e Público) para a edição atual. Deseja continuar?",
      showCancelButton: true,
      confirmButtonText: "Sim, recalcular",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    setIsCalculating(true);
    try {
      await presentationApi.calculateAllScores(eventEditionId);
      showAlert({
        icon: "success",
        title: "Sucesso!",
        text: "Notas recalculadas com sucesso.",
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erro ao recalcular as notas.";
      showAlert({
        icon: "error",
        title: "Erro",
        text: errorMsg,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleResetScores = async (
    target: "evaluators" | "committee" | "public",
  ) => {
    const eventEditionId = getEventEditionIdStorage();
    if (!eventEditionId) {
      showAlert({
        icon: "warning",
        title: "Edição não selecionada",
        text: "Selecione uma edição do evento.",
      });
      return;
    }

    const labels: Record<string, string> = {
      evaluators: "todas as notas da Banca Examinadora",
      committee:
        "todas as atribuições e notas da Comissão Organizadora (Avaliadores)",
      public: "todos os votos do Público",
    };

    const res = await showAlert({
      icon: "warning",
      title: "Atenção: Ação Destrutiva",
      text: `Tem certeza que deseja resetar ${labels[target]}? Esta ação não pode ser desfeita!`,
      showCancelButton: true,
      confirmButtonText: "Sim, resetar",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    setIsResetting(true);
    setResetOpen(false);
    try {
      if (target === "evaluators") {
        await presentationApi.resetEvaluatorsScores(eventEditionId);
      } else if (target === "committee") {
        await presentationApi.resetCommitteeScores(eventEditionId);
      } else {
        await presentationApi.resetPublicScores(eventEditionId);
      }
      showAlert({
        icon: "success",
        title: "Sucesso!",
        text: "Reset efetuado com sucesso.",
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erro ao efetuar o reset.";
      showAlert({
        icon: "error",
        title: "Erro",
        text: errorMsg,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ProtectedLayout>
      <PremiacaoProvider>
        <div className="w-full">
          <Banner title="Premiação" />
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Pesquise pelo nome da apresentação"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none border-2 border-brand-orange focus:border-[#E68A00] focus:ring-brand-orange/25"
                />
                <button
                  type="button"
                  className="flex min-w-10 items-center justify-center rounded-r-lg bg-brand-orange hover:bg-[#E68A00]"
                >
                  <Image
                    src="/assets/images/search.svg"
                    alt="Search icon"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              <Button
                type="button"
                className="whitespace-nowrap rounded-lg bg-brand-orange px-4 py-2 hover:bg-brand-orange disabled:opacity-50 text-sm font-semibold"
                onClick={handleRecalculateScores}
                disabled={isCalculating || isResetting}
              >
                {isCalculating ? "Recalculando..." : "Recalcular"}
              </Button>

              <div className="relative" ref={resetRef}>
                <Button
                  type="button"
                  variante="danger"
                  className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold"
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
                      ? "border-0 bg-brand-orange text-white shadow-sm"
                      : "border-2 border-brand-orange bg-white text-brand-orange hover:bg-orange-50",
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
