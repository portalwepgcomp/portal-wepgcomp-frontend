"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaApresentacoes from "@/features/apresentacoes/components/ListaApresentacoes";

export default function MinhaApresentacao() {
  return (
    <ProtectedLayout>
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
    </ProtectedLayout>
  );
}
