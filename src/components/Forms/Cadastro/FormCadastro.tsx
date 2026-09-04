"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUsers } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";

import Loading from "@/components/LoadingPage";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import PasswordEye from "@/components/UI/PasswordEye";
import { cn } from "@/utils/cn";

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

function CampoSenha({
  id,
  label,
  erro,
  eye,
  onToggleEye,
  registerProps,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: React.ReactNode;
  erro?: string;
  eye: boolean;
  onToggleEye: () => void;
  registerProps: ReturnType<ReturnType<typeof useForm<FormCadastroSchema>>["register"]>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <Campo label={label} htmlFor={id} erro={erro} className="mb-1">
      <div className="flex flex-row items-center gap-1 rounded-md border border-[#e4e4e4] px-1">
        <input
          type={eye ? "text" : "password"}
          id={id}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[#ADB5BD]"
          {...registerProps}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-1"
          onClick={onToggleEye}
          aria-label={eye ? "Ocultar senha" : "Mostrar senha"}
        >
          <PasswordEye color={eye ? "blue" : "black"} />
        </button>
      </div>
    </Campo>
  );
}

export function FormCadastro({ loadingCreateUser }: FormCadastroProps) {
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

  const [senha, setSenha] = useState("");
  const [requisitos, setRequisitos] = useState({
    minLength: false,
    hasLetter: false,
    number: false,
  });

  const aplicarMascaraCpf = (value: string): string => {
    const digits = value.replace(/\D/g, "");

    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleMudancaMatricula = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (perfil === "ouvinte" && watch("subperfil") === "outro") {
      const maskedValue = aplicarMascaraCpf(value);
      setValue("matricula", maskedValue);
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

  const handleChangeSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSenha(value);
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

  const [eye1, setEye1] = useState(false);
  const [eye2, setEye2] = useState(false);

  useEffect(() => {
    setValue("matricula", "");
  }, [perfil, setValue]);

  if (loadingCreateUser) {
    return <Loading />;
  }

  return (
    <form className="w-full max-w-[680px]" onSubmit={handleSubmit(handleFormCadastro)}>
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
            <label key={opcao.id} className={radioLabel} htmlFor={opcao.id}>
              <input
                type="radio"
                className="h-4 w-4 accent-brand-orange"
                id={opcao.id}
                {...register("perfil")}
                value={opcao.value}
              />
              {opcao.label}
              <i
                className="bi bi-info-circle"
                title={opcao.tooltip}
              />
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

      <CampoSenha
        id="senha"
        label={labelObrigatorio("Senha")}
        erro={errors.senha?.message}
        eye={eye1}
        onToggleEye={() => setEye1(!eye1)}
        registerProps={register("senha")}
        value={senha}
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

      <div className="mx-auto mt-2 flex w-full max-[1000px]:justify-center">
        <Button
          type="submit"
          className="w-full max-w-xs bg-brand-orange text-xl font-bold hover:bg-brand-orange max-[1000px]:mx-auto"
        >
          Cadastrar
        </Button>
      </div>
    </form>
  );
}
