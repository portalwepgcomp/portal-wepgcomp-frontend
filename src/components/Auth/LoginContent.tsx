"use client";

import { RegistrationClosedNotice } from "@/components/Auth/RegistrationClosedNotice";
import { FormLogin } from "@/components/Forms/Login/FormLogin";
import { useEdicao } from "@/hooks/useEdicao";
import Link from "next/link";

type LoginContentProps = {
  registrationOpen: boolean;
};

export function LoginContent({ registrationOpen }: LoginContentProps) {
  const { Edicao } = useEdicao();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[654px] flex-grow flex-col justify-center px-4 py-8 text-black">
      <div className="mx-auto w-full max-w-[654px]">
        <h1 className="ms-2 mt-5 flex justify-center border-b-4 border-brand-orange pb-2 text-5xl font-normal text-[#0066BA] max-[1000px]:text-2xl">
          {Edicao?.name || "WEPGCOMP"}
        </h1>
        <hr className="mx-auto my-0 max-w-[654px] border-[0.12rem] border-brand-orange" />
        <h2 className="mb-4 flex justify-center text-xl font-semibold">
          Acesse sua conta
        </h2>
      </div>

      <div className="mx-auto flex w-full max-w-[654px] flex-col">
        <div className="flex justify-center">
          <FormLogin />
        </div>
      </div>

      <div className="mx-auto mb-4 flex w-full max-w-[583px] justify-center">
        <div className="w-full text-start">
          {registrationOpen ? (
            <p>
              Ainda não tem conta?
              <Link
                href="/cadastro"
                className="ms-1 text-blue-600 no-underline hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          ) : (
            <RegistrationClosedNotice compact />
          )}
        </div>
      </div>
    </div>
  );
}
