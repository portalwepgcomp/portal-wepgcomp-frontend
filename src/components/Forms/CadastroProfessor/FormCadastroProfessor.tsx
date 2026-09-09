"use client";

import Button from "@/components/UI/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Info, UserPlus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrarErro } from "@/utils/logError";
import { useSweetAlert } from "@/hooks/useAlert";

import { Campo, Input } from "@/components/UI/Input";
import Spinner from "@/components/UI/Spinner";

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
      message: "E-mail deve ser institucional da UFBA (@ufba.br)",
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
    {texto} <span className="text-error font-bold">*</span>
  </>
);

export function FormCadastroProfessor({
  onSuccess,
  formRef,
  showButtons = true,
}: FormCadastroProfessorProps) {
  const { createProfessorBySuperadmin, loadingCreateProfessor } = useUsers();
  const { showAlert } = useSweetAlert();

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

  const handleFormCadastroProfessor = async (
    data: FormCadastroProfessorSchema,
  ) => {
    const { nome, email, matricula } = data;

    const body = {
      name: nome,
      email,
      registrationNumber: matricula,
    };

    try {
      await createProfessorBySuperadmin(body);
      reset();
      showAlert({
        icon: "success",
        title: "Professor Cadastrado!",
        text: "Uma senha temporária de primeiro acesso foi enviada ao e-mail institucional.",
      });
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
    <form
      onSubmit={handleSubmit(handleFormCadastroProfessor)}
      ref={formRef}
      className="space-y-6 w-full"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Campo
            label={
              <span className="text-sm font-semibold text-foreground">
                {labelObrigatorio("Nome Completo")}
              </span>
            }
            htmlFor="nome"
            erro={errors.nome?.message}
          >
            <Input
              type="text"
              id="nome"
              placeholder="Ex.: Prof. Dr. João Silva"
              className="text-sm rounded-lg"
              {...register("nome")}
              onChange={handleAoMudarDeNome}
              disabled={loadingCreateProfessor}
            />
          </Campo>
        </div>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("E-mail Institucional (@ufba.br)")}
            </span>
          }
          htmlFor="email"
          erro={errors.email?.message}
        >
          <Input
            type="email"
            id="email"
            placeholder="usuario@ufba.br"
            className="text-sm rounded-lg"
            {...register("email")}
            disabled={loadingCreateProfessor}
          />
        </Campo>

        <Campo
          label={
            <span className="text-sm font-semibold text-foreground">
              {labelObrigatorio("Número de Matrícula SIAPE")}
            </span>
          }
          htmlFor="matricula"
          erro={errors.matricula?.message}
        >
          <Input
            type="text"
            id="matricula"
            placeholder="Ex.: 1234567"
            className="text-sm rounded-lg"
            {...register("matricula")}
            onChange={handleMudancaMatricula}
            disabled={loadingCreateProfessor}
          />
        </Campo>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-blue-50/70 p-4 text-blue-900 border border-blue-100">
        <Info className="h-5 w-5 shrink-0 text-brand-blue mt-0.5" />
        <div className="text-sm leading-relaxed">
          <strong>Atenção:</strong> Uma senha temporária será gerada automaticamente e enviada por e-mail para o professor. O docente poderá redefini-la no primeiro acesso.
        </div>
      </div>

      {showButtons && (
        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-line pt-6">
          <Button size="lg" variante="primary"
            type="submit"
            disabled={loadingCreateProfessor}
          >
            {loadingCreateProfessor ? (
              <>
                <Spinner  colorClassName="text-white" />
                <span>Cadastrando...</span>
              </>
            ) : (
              <>
                <UserPlus  />
                <span>Cadastrar Professor</span>
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
