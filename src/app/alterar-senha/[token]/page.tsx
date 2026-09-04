"use client";

import { FormAlterarSenha } from "@/components/Forms/AlterarSenha/FormAlterarSenha";
import { useUsers } from "@/hooks/useUsers";
import LoadingPage from "@/components/LoadingPage";
import { useEdicao } from "@/hooks/useEdicao";

export default function AlterarSenha({ params }: { params: { token: string } }) {
  const { loadingResetPassword } = useUsers();
  const { Edicao } = useEdicao();

  return (
    <div className="relative mx-auto flex flex-grow flex-col bg-white text-black">
      {loadingResetPassword && <LoadingPage />}
      {!loadingResetPassword && (
        <>
          <div className="mx-auto w-full max-w-[654px]">
            <h1 className="ms-2 mt-5 flex justify-center text-5xl font-normal text-[#0066BA]">
              {Edicao?.name || "Carregando..."}
            </h1>
            <hr className="border-[0.125rem] border-brand-orange" />
            <h2 className="mb-4 flex justify-center text-2xl font-bold text-black">
              Alteração de Senha
            </h2>
          </div>
          <div className="mx-auto mb-5 flex justify-center">
            <FormAlterarSenha params={params} />
          </div>
        </>
      )}
    </div>
  );
}
