"use client";

import { Campo, Input } from "@/components/UI/Input";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";

import { useEdicao } from "@/hooks/useEdicao";

import ModalComponent from "@/components/UI/ModalComponent/ModalComponent";

export default function ModalAlterarSenha() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { resetPasswordSendEmail, loadingSendEmail } = useUsers();
  const { Edicao } = useEdicao();

  const validateEmail = (value: string) => {
    if (!value) return "O email é obrigatório.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "E-mail inválido!";
    return "";
  };

  const handleSendEmail = () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    const body = { email };
    resetPasswordSendEmail(body);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const validationError = validateEmail(value);
    setError(validationError);
  };

  return (
    <ModalComponent
      id="alterarSenhaModal"
      loading={loadingSendEmail}
      labelConfirmButton="Enviar"
      disabledConfirmButton={!email || !!error}
      colorButtonConfirm="#0065A3"
      onConfirm={handleSendEmail}
    >
      <div className="flex w-full flex-col items-center text-black">
        <h1 className="mt-5 flex justify-center border-b-[3px] border-brand-orange pb-2 text-xl font-normal">
          {Edicao?.name || "Carregando..."}
        </h1>
        <hr className="my-4 w-full border-line" />

        <div className="mb-4 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold">Esqueci minha senha</h2>
          <p className="mt-2 max-w-md text-center">
            Por favor, informe o e-mail cadastrado em sua conta, e enviaremos um
            link com as instruções para recuperação.
          </p>
        </div>

        <Campo
          label={
            <>
              E-mail <span className="text-error">*</span>
            </>
          }
          htmlFor="email-alterar-senha"
          erro={error}
          className="mb-4 w-full max-w-[80%]"
        >
          <Input
            type="email"
            id="email-alterar-senha"
            placeholder="Insira seu e-mail"
            value={email}
            onChange={handleEmailChange}
          />
        </Campo>
      </div>
    </ModalComponent>
  );
}
