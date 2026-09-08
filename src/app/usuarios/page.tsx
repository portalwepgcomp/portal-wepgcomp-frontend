"use client"

import Gerenciar from "@/components/GerenciarUsuario/Gerenciar";
import Banner from "@/components/UI/Banner";

export default function Gerenciamento() {
  return (
    <div className="flex flex-col gap-[30px]">
      <Banner title="Gerenciamento de Usuários" />
      <Gerenciar />
    </div>
  );
}
