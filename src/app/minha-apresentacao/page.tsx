"use client";

import ModalEditarCadastro from "@/components/Modals/ModalEdicaoCadastro/ModalEditarCadastro";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaApresentacoes from "@/features/apresentacoes/components/ListaApresentacoes";

export default function MinhaApresentacao() {
  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-[3.125rem]">
        <ListaApresentacoes
          titulo="Minha Apresentação"
          escopo="minhas"
          ocultarBusca
          criacao={{
            rotulo: "Incluir Apresentação",
            modo: "rota",
            href: "/cadastro-apresentacao",
          }}
        />
        <ModalEditarCadastro />
      </div>
    </ProtectedLayout>
  );
}
