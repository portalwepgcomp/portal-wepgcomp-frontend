"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { useUsers } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrarErro } from "@/utils/logError";

import InfoBox from "@/components/InfoBox/InfoBox";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import Spinner from "@/components/UI/Spinner";
import { cn } from "@/utils/cn";

const formCadastroProfessorSchema = z.object({
  nome: z
    .string({ invalid_type_error: "Campo Inválido" })
    .min(1, "O nome é obrigatório.")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, {
      message: "Nome deve conter apenas letras e espaços.",
    }),
  email: z
    .string({ invalid_type_error: "Campo inválido!" })
    .min(1, "O email é obrigatório.")
    .email({ message: "E-mail inválido!" })
    .refine((email) => email.toLowerCase().endsWith("@ufba.br"), {
      message: "E-mail deve ser da UFBA (@ufba.br)",
    }),
  matricula: z
    .string({ invalid_type_error: "Campo inválido!" })
    .min(1, "A matrícula é obrigatória.")
    .regex(/^\d+$/, {
      message: "Matrícula deve conter apenas números.",
    }),
});

type FormCadastroProfessorSchema = z.infer<typeof formCadastroProfessorSchema>;

interface FormCadastroProfessorProps {
  onSuccess?: () => void;
  formRef?: React.RefObject<HTMLFormElement>;
  showButtons?: boolean;
}

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

const inputComErro = (temErro: boolean) =>
  cn(
    "text-base",
    temErro && "border-error focus:border-error focus:ring-error/10",
  );

export function FormCadastroProfessor({ onSuccess, formRef, showButtons = true }: FormCadastroProfessorProps) {
  const { createProfessorBySuperadmin, loadingCreateProfessor } = useUsers();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormCadastroProfessorSchema>({
    resolver: zodResolver(formCadastroProfessorSchema),
    defaultValues: {
      nome: "",
      email: "",
      matricula: "",
    },
  });

  const handleFormCadastroProfessor = async (data: FormCadastroProfessorSchema) => {
    const { nome, email, matricula } = data;

    const body = {
      name: nome,
      email,
      registrationNumber: matricula,
    };

    try {
      await createProfessorBySuperadmin(body);
      reset();
      onSuccess?.();
    } catch (error) {
      registrarErro("Erro ao cadastrar professor", error);
    }
  };

  const handleAoMudarDeNome = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setValue("nome", filteredValue);
  };

  const handleMudancaMatricula = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/\D/g, "");
    setValue("matricula", numbersOnly);
  };

  return (
    <div className="mx-auto max-w-[800px] rounded-xl bg-white p-8 shadow-md max-md:mx-4 max-md:p-6">
      <form onSubmit={handleSubmit(handleFormCadastroProfessor)} ref={formRef}>
        <Campo
          label={
            <span className="text-xl font-bold text-[#2c3e50]">
              {labelObrigatorio("Nome completo")}
            </span>
          }
          htmlFor="nome"
          erro={errors.nome?.message}
          className="mb-3"
        >
          <Input
            type="text"
            id="nome"
            placeholder="Insira o nome completo do professor"
            className={inputComErro(!!errors.nome)}
            {...register("nome")}
            onChange={handleAoMudarDeNome}
            disabled={loadingCreateProfessor}
          />
        </Campo>

        <Campo
          label={
            <span className="text-xl font-bold text-[#2c3e50]">
              {labelObrigatorio("E-mail institucional")}
            </span>
          }
          htmlFor="email"
          erro={errors.email?.message}
          className="mb-3"
        >
          <Input
            type="email"
            id="email"
            placeholder="professor@ufba.br"
            className={inputComErro(!!errors.email)}
            {...register("email")}
            disabled={loadingCreateProfessor}
          />
          <p className="mt-1 text-sm text-muted">
            O email deve ser da UFBA (terminar com @ufba.br)
          </p>
        </Campo>

        <Campo
          label={
            <span className="text-xl font-bold text-[#2c3e50]">
              {labelObrigatorio("Número de matrícula")}
            </span>
          }
          htmlFor="matricula"
          erro={errors.matricula?.message}
          className="mb-4"
        >
          <Input
            type="text"
            id="matricula"
            placeholder="Digite o número de matrícula"
            className={inputComErro(!!errors.matricula)}
            {...register("matricula")}
            onChange={handleMudancaMatricula}
            disabled={loadingCreateProfessor}
          />
        </Campo>

        <div className="mb-3">
          <InfoBox
            title="Informação importante:"
            message="Uma senha temporária será gerada automaticamente e enviada por email para o professor.
              O professor poderá alterar a senha no primeiro acesso."
          />
        </div>

        {showButtons && (
          <div className="flex justify-end gap-3 max-md:flex-col-reverse">
            <Button
              type="submit"
              disabled={loadingCreateProfessor}
              className="bg-brand-blue px-6 py-3 font-semibold hover:bg-[#0056b3] max-md:w-full"
            >
              {loadingCreateProfessor ? (
                <>
                  <Spinner className="h-4 w-4" colorClassName="text-white" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Professor"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
