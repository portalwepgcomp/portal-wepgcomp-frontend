"use client";

import { FormEdicao } from "@/components/Forms/CadastroEdicao/FormEdicao";
import { useEdicao } from "@/hooks/useEdicao";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";

export default function CadastroEdicao() {
  const { Edicao } = useEdicao();

  return (
    <ProtectedLayout>
      <div className="flex flex-col items-center justify-center gap-20 max-[480px]:gap-20">
        <div className="mb-2.5 flex flex-col items-center">
          <h1 className="ms-2 mt-5 flex justify-center text-5xl font-normal text-[#0066ba]">
            {Edicao?.name || "Carregando..."}
          </h1>
          <hr className="w-[600px] border border-brand-orange max-md:w-full" />
        </div>
        <div className="mb-2.5 text-center text-[28px] leading-[15px] font-bold text-[#343a40] max-[480px]:text-[15px]">
          Cadastro de Edição
        </div>
        <FormEdicao />
      </div>
    </ProtectedLayout>
  );
}
