"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

import { useSweetAlert } from "@/hooks/useAlert";
import { useUsers } from "@/hooks/useUsers";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { FormCadastroApresentacao } from "@/components/Forms/CadastroApresentacao/FormCadastroApresentacao";
import LoadingPage from "@/components/LoadingPage";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import { useEdicao } from "@/hooks/useEdicao";

export default function CadastroApresentacao() {
  const { loadingCreateUser } = useUsers();
  const { user } = useContext(AuthContext);
  const { Edicao } = useEdicao();
  const { showAlert } = useSweetAlert();
  const router = useRouter();

  useEffect(() => {
    if (user?.profile !== "Presenter") {
      showAlert({
        icon: "error",
        title: "Acesso não autorizado",
        text: "Você não tem permissão para acessar esta página.",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/");
      });
    }
  }, []);

  return (
    <ProtectedLayout>
      <div className="relative mx-auto flex w-full max-w-[680px] flex-grow flex-col text-black">
        {loadingCreateUser && <LoadingPage />}
        {!loadingCreateUser && (
          <>
            <div className="mx-auto w-full">
              <h1 className="ms-2 mt-5 flex justify-center text-5xl font-extrabold text-[#0066BA]">
                {Edicao?.name || "Carregando..."}
              </h1>
              <hr className="border-[0.125rem] border-brand-orange" />
            </div>
            <div className="mx-auto mb-5 flex w-full justify-center">
              <FormCadastroApresentacao />
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
}
