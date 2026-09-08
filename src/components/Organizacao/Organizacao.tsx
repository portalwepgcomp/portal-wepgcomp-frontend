"use client";

import { useEffect, useMemo, useRef } from "react";
import { useCommittee } from "@/hooks/useCommittee";
import { useEdicao } from "@/hooks/useEdicao";

export default function Organizacao() {
  const { getCommitterAll, committerList } = useCommittee();
  const { Edicao } = useEdicao();
  const lastFetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (Edicao?.id && lastFetchedIdRef.current !== Edicao.id) {
      lastFetchedIdRef.current = Edicao.id;
      getCommitterAll(Edicao.id);
    }
  }, [Edicao?.id, getCommitterAll]);

  const coordenador = useMemo(() => {
    const coord = committerList.find(
      (member) =>
        member.level === "Coordinator" &&
        member.role === "OrganizingCommittee",
    );
    return coord ? coord.userName : " ";
  }, [committerList]);

  const groupedMembers = useMemo(() => {
    const groups: Record<string, string[]> = {
      comissao: [],
    };

    if (committerList.length === 0) return groups;

    committerList.forEach((member) => {
      if (member.level === "Coordinator") return;

      switch (member.role) {
        case "OrganizingCommittee":
          groups.comissao.push(member.userName);
          break;
        default:
          break;
      }
    });

    return groups;
  }, [committerList]);

  function formatTeam(team: string[]) {
    if (!Array.isArray(team) || team.length === 0) {
      return "";
    }
    return team
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .join(", ");
  }

  return (
    <section className="flex w-full items-center justify-center bg-gradient-to-br from-brand-gold to-[rgb(247,168,90)] py-10 sm:py-12 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 text-[#222] shadow-md transition duration-300 hover:shadow-lg">
        <h2 className="mb-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy">
          Organização
        </h2>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border-l-4 border-brand-accent bg-[#f9f9f9] px-5 py-4 transition hover:bg-[#fff5e6]">
            <h3 className="mb-1 text-base sm:text-lg font-bold text-brand-accent">
              Coordenação geral
            </h3>
            <p className="m-0 text-sm sm:text-base leading-relaxed text-[#333]">
              {coordenador}
            </p>
          </div>

          <div className="rounded-xl border-l-4 border-brand-accent bg-[#f9f9f9] px-5 py-4 transition hover:bg-[#fff5e6]">
            <h3 className="mb-1 text-base sm:text-lg font-bold text-brand-accent">
              Comissão organizadora
            </h3>
            <p className="m-0 text-sm sm:text-base leading-relaxed text-[#333]">
              {formatTeam(groupedMembers.comissao)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
