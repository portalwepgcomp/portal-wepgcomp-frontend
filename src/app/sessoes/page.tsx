"use client";

import ModalSessao from "@/components/Modals/ModalSessao/ModalSessao";
import ModalSessaoOrdenarApresentacoes from "@/components/Modals/ModalSessaoOrdenarApresentacoes/ModalSessaoOrdenarApresentacoes";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaSessoes from "@/features/sessoes/components/ListaSessoes";

export default function Sessoes() {
  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-[50px]">
        <ListaSessoes />
        <ModalSessao />
        <ModalSessaoOrdenarApresentacoes />
      </div>
    </ProtectedLayout>
  );
}
