"use client";

import { FormCadastro } from "@/components/Forms/Cadastro/FormCadastro";
import LoadingPage from "@/components/LoadingPage";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useUsers } from "@/hooks/useUsers";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function Cadastro() {
  const { loadingCreateUser } = useUsers();
  const { signed } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (signed) {
      router.push("/home");
    }
  }, [signed, router]);

  return (
    <div className="relative mx-auto flex w-full max-w-[540px] flex-grow flex-col px-4 py-8 text-black">
      {loadingCreateUser && <LoadingPage />}
      <div className="mx-auto w-full mb-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">
          {!loadingCreateUser && "Cadastro"}
        </h2>
      </div>
      <div className="mx-auto mb-5 flex w-full justify-center">
        {!loadingCreateUser && (
          <FormCadastro loadingCreateUser={loadingCreateUser} />
        )}
      </div>
    </div>
  );
}
