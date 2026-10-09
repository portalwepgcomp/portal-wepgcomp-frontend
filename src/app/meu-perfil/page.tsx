"use client";

import { FormMeuPerfil } from "@/components/Forms/MeuPerfil/FormMeuPerfil";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";

export default function MeuPerfil() {
  return (
    <ProtectedLayout>
      <div className="relative mx-auto flex flex-grow flex-col bg-white text-black">
        <div className="mx-auto w-full max-w-[654px]">
          <h1 className="mb-4 mt-5 flex justify-center text-2xl font-bold text-black">
            Meu perfil
          </h1>
        </div>
        <div className="mx-auto mb-5 flex w-full justify-center px-4">
          <FormMeuPerfil />
        </div>
      </div>
    </ProtectedLayout>
  );
}
