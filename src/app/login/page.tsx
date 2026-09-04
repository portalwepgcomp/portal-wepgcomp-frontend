"use client";

import { FormLogin } from "@/components/Forms/Login/FormLogin";
import ModalAlterarSenha from "@/components/Modals/ModalAlterarSenha/ModalAlterarSenha";
import { useEdicao } from "@/hooks/useEdicao";
import Link from "next/link";

export default function Login() {
  const { Edicao } = useEdicao();

  return (
    <div className="mx-auto flex max-w-[654px] flex-grow flex-col text-black">
      <div className="mx-auto w-full max-w-[654px]">
        <h1 className="ms-2 mt-5 flex justify-center border-b-4 border-brand-orange pb-2 text-5xl font-normal text-[#0066BA] max-[1000px]:text-2xl">
          {Edicao?.name || "Carregando..."}
        </h1>
        <hr className="mx-auto my-0 max-w-[654px] border-[0.12rem] border-brand-orange" />
        <h4 className="mb-4 flex justify-center text-xl font-semibold">
          Acesse sua conta
        </h4>
      </div>

      <div className="mx-auto flex w-full max-w-[654px] flex-col">
        <div className="flex justify-center">
          <FormLogin />
        </div>
      </div>

      <div className="mx-auto mb-4 flex flex-grow justify-center">
        <div className="w-full max-w-[583px] text-start">
          <h6>
            Ainda não tem conta?
            <Link
              href="/cadastro"
              className="ms-1 text-blue-600 no-underline hover:underline"
            >
              Cadastre-se
            </Link>
          </h6>
        </div>
      </div>

      <ModalAlterarSenha />
    </div>
  );
}
