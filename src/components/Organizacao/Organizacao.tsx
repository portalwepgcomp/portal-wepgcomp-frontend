"use client";

import { useEffect, useMemo } from "react";
import { useCommittee } from "@/hooks/useCommittee";
import { useEdicao } from "@/hooks/useEdicao";

export default function Organizacao() {
  const { getCommitterAll, committerList } = useCommittee();
  const { Edicao } = useEdicao();

  useEffect(() => {
    if (Edicao?.id) {
      getCommitterAll(Edicao.id);
    }
  }, [Edicao?.id]);

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
    <section className="flex w-full items-center justify-center bg-gradient-to-br from-brand-gold to-[rgb(247,168,90)] py-16">
      <div className="w-[80%] rounded-3xl bg-white p-12 text-[#222] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl max-md:w-[90%] max-md:p-8">
        <h1 className="mb-8 text-center text-[2.8rem] font-bold tracking-wide text-brand-navy max-md:text-[2rem]">
          Organização
        </h1>

        <div className="flex flex-col gap-8">
          <div className="rounded-2xl border-l-[5px] border-brand-accent bg-[#f9f9f9] px-6 py-5 transition hover:bg-[#fff5e6]">
            <h3 className="mb-2 text-xl font-semibold text-brand-accent max-md:text-lg">
              Coordenação geral
            </h3>
            <p className="text-[1.05rem] leading-relaxed text-[#333] max-md:text-[0.95rem]">
              {coordenador}
            </p>
          </div>

          <div className="rounded-2xl border-l-[5px] border-brand-accent bg-[#f9f9f9] px-6 py-5 transition hover:bg-[#fff5e6]">
            <h3 className="mb-2 text-xl font-semibold text-brand-accent max-md:text-lg">
              Comissão organizadora
            </h3>
            <p className="text-[1.05rem] leading-relaxed text-[#333] max-md:text-[0.95rem]">
              {formatTeam(groupedMembers.comissao)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
