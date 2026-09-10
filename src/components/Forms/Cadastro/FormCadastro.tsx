"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUsers } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileType, SubprofileType, RegisterUserParams } from "@/models/user";

import Loading from "@/components/LoadingPage";
import Button from "@/components/UI/Button";
import { Campo, Input, PasswordInput } from "@/components/UI/Input";
import { Info, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/utils/cn";
import { maskCPF } from "@/lib/masks";

const formCadastroSchema = z
  .object({
    nome: z
      .string({ invalid_type_error: "Campo Inválido" })
      .min(1, "O nome é obrigatório.")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, {
        message: "Preenchimento obrigatório.",
      }),
    perfil: z.enum(["apresentador", "professor", "ouvinte"], {
      required_error: "A escolha do perfil é obrigatória!",
      invalid_type_error: "Campo inválido!",
    }),
    subperfil: z
      .enum(["doutorando", "mestrando", "graduando", "outro"])
      .nullable()
      .optional(),
    matricula: z.string().optional(),
    linkLattes: z.string().optional(),
    email: z
      .string({ invalid_type_error: "Campo inválido!" })
      .min(1, "O email é obrigatório.")
      .email({ message: "E-mail inválido!" }),
    senha: z.string({ invalid_type_error: "Campo inválido" }).min(8, {
      message: "A senha é obrigatória e deve ter, pelo menos, 8 caracteres.",
    }),
    confirmaSenha: z
      .string({ invalid_type_error: "Campo inválido" })
      .min(1, { message: "Confirmação de senha é obrigatória!" }),
  })
  .superRefine((data, ctx) => {
    const raw = (data.matricula ?? "").trim();
    if (!raw) {
      ctx.addIssue({
        path: ["matricula"],
        message:
          data.perfil === "ouvinte"
            ? "CPF é obrigatório."
            : "Matrícula é obrigatória.",
        code: z.ZodIssueCode.custom,
      });
      return;
    }

    if (data.perfil === "ouvinte" && data.subperfil === "outro") {
      const digits = raw.replace(/\D/g, "");
      if (!/^\d{11}$/.test(digits)) {
        ctx.addIssue({
          path: ["matricula"],
          message: "CPF inválido. Deve conter 11 dígitos.",
          code: z.ZodIssueCode.custom,
        });
      }
    } else {
      if (!/^\d{1,19}$/.test(raw)) {
        ctx.addIssue({
          path: ["matricula"],
          message: "Matrícula inválida. Use somente dígitos (até 19).",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (
      (data.perfil === "professor" ||
        data.perfil === "apresentador" ||
        (data.perfil === "ouvinte" && data.subperfil !== "outro")) &&
      data.email &&
      !data.email.toLowerCase().endsWith("@ufba.br")
    ) {
      ctx.addIssue({
        path: ["email"],
        message: "E-mail inválido. Deve ser um e-mail da UFBA.",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.perfil === "ouvinte" && !data.subperfil) {
      ctx.addIssue({
        path: ["subperfil"],
        message: "Selecione um subperfil",
        code: z.ZodIssueCode.custom,
      });
    }
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    message: "As senhas não conferem!",
    path: ["confirmaSenha"],
  });

type FormCadastroSchema = z.infer<typeof formCadastroSchema>;

interface FormCadastroProps {
  loadingCreateUser: boolean;
}

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

const radioLabel =
  "flex cursor-pointer items-center gap-2 text-sm font-bold text-foreground";

export function FormCadastro({ loadingCreateUser }: Readonly<FormCadastroProps>) {
  const { registerUser } = useUsers();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormCadastroSchema>({
    resolver: zodResolver(formCadastroSchema),
    defaultValues: {
      perfil: "apresentador",
      matricula: "",
    },
  });

  const [requisitos, setRequisitos] = useState({
    minLength: false,
    hasLetter: false,
    number: false,
  });

  const handleMudancaMatricula = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (perfil === "ouvinte" && watch("subperfil") === "outro") {
      setValue("matricula", maskCPF(value));
    } else {
      const numbersOnly = value.replace(/\D/g, "");
      setValue("matricula", numbersOnly);
    }
  };

  const handleFormCadastro = (data: FormCadastroSchema) => {
    const {
      nome,
      email,
      senha,
      perfil,
      matricula = "",
      subperfil,
      linkLattes,
    } = data;

    const profileFormated: Record<string, ProfileType> = {
      apresentador: "Presenter",
      professor: "Professor",
      ouvinte: "Listener",
    };

    const subprofileFormated: Record<string, SubprofileType> = {
      doutorando: "Doctorate",
      mestrando: "Master",
      graduando: "Bachelor",
      outro: "Other",
    };

    const raw = matricula.trim();
    const registrationNumber =
      perfil === "ouvinte" && watch("subperfil") === "outro"
        ? raw.replace(/\D/g, "")
        : raw;

    const body = {
      name: nome,
      email,
      password: senha,
      registrationNumber,
      profile: profileFormated[perfil],
      registrationNumberType: perfil === "ouvinte" ? "CPF" : "MATRICULA",
      subprofile:
        perfil === "ouvinte"
          ? (subprofileFormated[subperfil ?? "outro"] ?? null)
          : null,
      ...(linkLattes && { linkLattes: linkLattes }),
    };

    registerUser(body as RegisterUserParams);
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

  const handleAoMudarDeNome = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setValue("nome", filteredValue);
  };

  const perfil = watch("perfil");
  const subperfil = watch("subperfil");

  useEffect(() => {
    setValue("matricula", "");
  }, [perfil, setValue]);

  if (loadingCreateUser) {
    return <Loading />;
  }

  return (
    <form className="w-full max-w-[540px]" onSubmit={handleSubmit(handleFormCadastro)}>
      <Campo
        label={labelObrigatorio("Nome completo")}
        htmlFor="nome"
        erro={errors.nome?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="nome"
          placeholder="Insira seu nome"
          className="text-sm"
          {...register("nome")}
          onChange={handleAoMudarDeNome}
        />
      </Campo>

      <Campo
        label={labelObrigatorio("Perfil")}
        erro={errors.perfil?.message}
        className="mb-1"
      >
        <div className="flex flex-wrap gap-4">
          {[
            {
              id: "radio1",
              value: "apresentador",
              label: "Apresentador (PGCOMP)",
              tooltip:
                "Aluno do PGCOMP que irá apresentar projetos no workshop.",
            },
            {
              id: "radio2",
              value: "professor",
              label: "Professor (PGCOMP)",
              tooltip:
                "Professor do PGCOMP que poderá assistir e avaliar os projetos apresentados no workshop.",
            },
            {
              id: "radio3",
              value: "ouvinte",
              label: "Ouvinte",
              tooltip:
                "Participantes que irão assistir ou expor no workshop.",
            },
          ].map((opcao) => (
            <label
              key={opcao.id}
              className={cn(
                radioLabel,
                "inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900",
              )}
              htmlFor={opcao.id}
            >
              <input
                type="radio"
                className="h-4 w-4 accent-brand-orange cursor-pointer"
                id={opcao.id}
                {...register("perfil")}
                value={opcao.value}
              />
              <span>{opcao.label}</span>
              <span title={opcao.tooltip} className="inline-flex items-center">
                <Info
                  className="h-4 w-4 cursor-pointer text-slate-400 transition hover:text-slate-600"
                  aria-label={opcao.tooltip}
                />
              </span>
            </label>
          ))}
        </div>
      </Campo>

      {perfil === "ouvinte" && (
        <Campo
          label={labelObrigatorio("Tipo de ouvinte")}
          erro={errors.subperfil?.message}
          className="mb-1"
        >
          <div className="flex flex-wrap gap-4">
            {(["doutorando", "mestrando", "graduando", "outro"] as const).map(
              (tipo) => (
                <label key={tipo} className={radioLabel} htmlFor={`sub-${tipo}`}>
                  <input
                    type="radio"
                    className="h-4 w-4 accent-brand-orange"
                    id={`sub-${tipo}`}
                    value={tipo}
                    {...register("subperfil")}
                  />
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </label>
              ),
            )}
          </div>
        </Campo>
      )}

      <Campo
        label={labelObrigatorio(
          perfil === "ouvinte" && subperfil === "outro"
            ? "CPF"
            : perfil === "professor"
              ? "Matrícula SIAPE"
              : "Matrícula",
        )}
        htmlFor="matricula"
        erro={errors.matricula?.message}
        className="mb-1"
      >
        <Input
          type="text"
          id="matricula"
          placeholder={
            perfil === "ouvinte"
              ? "000.000.000-00"
              : perfil === "professor"
                ? "Insira sua matrícula SIAPE"
                : "Insira sua matrícula"
          }
          className="text-sm"
          {...register("matricula")}
          onChange={handleMudancaMatricula}
          maxLength={
            perfil === "professor"
              ? 19
              : perfil === "ouvinte" && subperfil === "outro"
                ? 14
                : undefined
          }
        />
      </Campo>

      <Campo label="Link Lattes" htmlFor="linkLattes" erro={errors.linkLattes?.message} className="mb-1">
        <Input
          type="text"
          id="linkLattes"
          placeholder="Insira seu link do perfil Lattes"
          className="text-sm"
          {...register("linkLattes")}
          maxLength={50}
        />
      </Campo>

      <Campo
        label={labelObrigatorio(`E-mail ${perfil !== "ouvinte" ? "UFBA" : ""}`.trim())}
        htmlFor="email"
        erro={errors.email?.message}
        className="mb-1"
      >
        <Input
          type="email"
          id="email"
          placeholder="Insira seu e-mail"
          className="text-sm"
          {...register("email")}
        />
      </Campo>

      <Campo
        label={labelObrigatorio("Senha")}
        htmlFor="senha"
        erro={errors.senha?.message}
        className="mb-1"
      >
        <PasswordInput
          id="senha"
          placeholder="Insira sua senha"
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
                "text-xs font-semibold",
                req.ok ? "text-success" : "text-error",
              )}
            >
              {req.ok ? (
                <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-success" aria-hidden="true" />
              ) : (
                <ShieldX className="h-3.5 w-3.5 inline mr-1 text-error" aria-hidden="true" />
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

      <div className="mt-2">
        <Button
          type="submit"
          className="w-full h-10 text-xl font-bold "
        >
          Cadastrar
        </Button>
      </div>
    </form>
  );
}
