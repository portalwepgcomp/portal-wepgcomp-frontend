"use client";

import { useUsers } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PasswordEye from "@/components/UI/PasswordEye";
import Button from "@/components/UI/Button";
import { Campo } from "@/components/UI/Input";
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

function CampoSenha({
  id,
  label,
  erro,
  eye,
  onToggleEye,
  registerProps,
  onChange,
  placeholder,
}: {
  id: string;
  label: React.ReactNode;
  erro?: string;
  eye: boolean;
  onToggleEye: () => void;
  registerProps: ReturnType<
    ReturnType<typeof useForm<FormAlterarSenhaSchema>>["register"]
  >;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <Campo label={label} htmlFor={id} erro={erro} className="mb-1">
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-1 flex-row items-center gap-1 rounded-md border border-[#e4e4e4] px-1">
          <input
            type={eye ? "text" : "password"}
            id={id}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[#ADB5BD]"
            {...registerProps}
            onChange={onChange}
          />
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-1"
            onClick={onToggleEye}
          >
            <PasswordEye color={eye ? "blue" : "black"} />
          </button>
        </div>
      </div>
    </Campo>
  );
}

export function FormAlterarSenha({ params }: { params: { token: string } }) {
  const { resetPassword } = useUsers();
  const [eye1, setEye1] = useState(false);
  const [eye2, setEye2] = useState(false);

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

  const handleFormCadastro = (data: FormAlterarSenhaSchema) => {
    resetPassword({ token: params.token, newPassword: data.senha });
  };

  const handleChangeSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <form className="w-full max-w-[583px]" onSubmit={handleSubmit(handleFormCadastro)}>
      <CampoSenha
        id="senha"
        label={labelObrigatorio("Senha")}
        erro={errors.senha?.message}
        eye={eye1}
        onToggleEye={() => setEye1(!eye1)}
        registerProps={register("senha")}
        onChange={handleChangeSenha}
        placeholder="Insira sua senha"
      />

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
                "text-xs font-semibold",
                req.ok ? "text-success" : "text-error",
              )}
            >
              <i
                className={cn(
                  "bi",
                  req.ok ? "bi-shield-fill-check" : "bi-shield-fill-x",
                )}
              />{" "}
              {req.text}
            </li>
          ))}
        </ul>
      </div>

      <CampoSenha
        id="confirmaSenha"
        label={labelObrigatorio("Confirmação de senha")}
        erro={errors.confirmaSenha?.message}
        eye={eye2}
        onToggleEye={() => setEye2(!eye2)}
        registerProps={register("confirmaSenha")}
        placeholder="Insira sua senha novamente"
      />

      <div className="mx-auto mt-4 flex justify-center">
        <Button
          type="submit"
          className="bg-brand-orange text-xl font-bold hover:bg-brand-orange"
        >
          Enviar
        </Button>
      </div>
    </form>
  );
}
