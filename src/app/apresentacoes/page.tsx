"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaApresentacoes from "@/features/apresentacoes/components/ListaApresentacoes";

export default function Apresentacoes() {
  return (
    <ProtectedLayout>
      <ListaApresentacoes
        titulo="Apresentações"
        escopo="todas"
        criacao={{ rotulo: "Incluir Apresentação", modo: "rota", href: "/cadastro-apresentacao" }}
      />
    </ProtectedLayout>
  );
}
