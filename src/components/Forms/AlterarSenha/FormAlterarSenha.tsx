"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, ShieldX } from "lucide-react";

import { useUsers } from "@/hooks/useUsers";
import Button from "@/components/UI/Button";
import { Campo, PasswordInput } from "@/components/UI/Input";
import { cn } from "@/utils/cn";

const formAlterarSenhaSchema = z
  .object({
    senha: z
      .string()
      .nonempty("Senha é obrigatória!")
      .min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmaSenha: z.string().nonempty("Confirmação de senha é obrigatória!"),
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    message: "As senhas não conferem!",
    path: ["confirmaSenha"],
  });

type FormAlterarSenhaSchema = z.infer<typeof formAlterarSenhaSchema>;

export function FormAlterarSenha({ params }: Readonly<{ params: { token: string } }>) {
  const { resetPassword } = useUsers();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormAlterarSenhaSchema>({
    resolver: zodResolver(formAlterarSenhaSchema),
  });

  const [requisitos, setRequisitos] = useState({
    minLength: false,
    hasLetter: false,
    number: false,
  });

  const handleFormAlterarSenha = (data: FormAlterarSenhaSchema) => {
    resetPassword({ token: params.token, newPassword: data.senha });
  };

  const { onChange: onSenhaChange, ...senhaRegisterProps } = register("senha");

  const handleChangeSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSenhaChange(e);
    const value = e.target.value;
    setRequisitos({
      minLength: value.length >= 8,
      hasLetter: /[a-zA-Z]/.test(value),
      number: /\d/.test(value),
    });
  };

  const labelObrigatorio = (texto: string) => (
    <>
      {texto} <span className="text-error">*</span>
    </>
  );

  return (
    <form className="w-full max-w-[583px]" onSubmit={handleSubmit(handleFormAlterarSenha)}>
      <Campo
        label={labelObrigatorio("Senha")}
        htmlFor="senha"
        erro={errors.senha?.message}
        className="mb-1"
      >
        <PasswordInput
          id="senha"
          placeholder="Insira sua nova senha"
          {...senhaRegisterProps}
          onChange={handleChangeSenha}
        />
      </Campo>

      <div className="mb-1 mt-3">
        <p className="mb-1 text-xs font-semibold text-[#555555]">
          A senha deve possuir pelo menos:
        </p>
        <ul className="mb-0 list-none pl-0">
          {[
            { ok: requisitos.minLength, text: "8 dígitos" },
            { ok: requisitos.hasLetter, text: "1 letra" },
            { ok: requisitos.number, text: "1 número" },
          ].map((req) => (
            <li
              key={req.text}
              className={cn(
                "text-xs font-semibold flex items-center gap-1 mb-1",
                req.ok ? "text-success" : "text-error",
              )}
            >
              {req.ok ? (
                <ShieldCheck className="h-3.5 w-3.5 inline text-success" aria-hidden="true" />
              ) : (
                <ShieldX className="h-3.5 w-3.5 inline text-error" aria-hidden="true" />
              )}
              {req.text}
            </li>
          ))}
        </ul>
      </div>

      <Campo
        label={labelObrigatorio("Confirmação de senha")}
        htmlFor="confirmaSenha"
        erro={errors.confirmaSenha?.message}
        className="mb-1"
      >
        <PasswordInput
          id="confirmaSenha"
          placeholder="Insira sua senha novamente"
          {...register("confirmaSenha")}
        />
      </Campo>

      <div className="mx-auto mt-4 flex justify-center">
        <Button size="lg" variante="primary"
          type="submit"
        >
          Enviar
        </Button>
      </div>
    </form>
  );
}
