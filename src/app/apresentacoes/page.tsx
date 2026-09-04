"use client";

import ModalEditarCadastro from "@/components/Modals/ModalEdicaoCadastro/ModalEditarCadastro";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaApresentacoes from "@/features/apresentacoes/components/ListaApresentacoes";

export default function Apresentacoes() {
  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-[3.125rem]">
        <ListaApresentacoes
          titulo="Apresentações"
          escopo="todas"
          criacao={{ rotulo: "Incluir Apresentação", modo: "modal" }}
        />
        <ModalEditarCadastro />
      </div>
    </ProtectedLayout>
  );
}
