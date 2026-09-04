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
    <div className="relative mx-auto flex w-full max-w-[680px] flex-grow flex-col text-black">
      {loadingCreateUser && <LoadingPage />}
      <div className="mx-auto w-full">
        <hr className="border-[0.12rem] border-brand-orange" />
        <h2 className="mb-4 flex justify-center text-5xl font-bold text-black max-[1000px]:text-2xl">
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
