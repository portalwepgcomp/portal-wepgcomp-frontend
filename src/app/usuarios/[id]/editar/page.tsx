"use client";

import InfoBox from "@/components/InfoBox/InfoBox";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import Banner from "@/components/UI/Banner";
import Button from "@/components/UI/Button";
import { Campo, Input } from "@/components/UI/Input";
import { useSweetAlert } from "@/hooks/useAlert";
import { useUsers } from "@/hooks/useUsers";
import { UpdateUserRequest } from "@/models/update-user";
import { User } from "@/models/user";
import { maskCPF, unmask } from "@/utils/masks";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const updateUserSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Por favor, insira um email válido."),
    profile: z.enum(["Presenter", "Professor", "Listener"], {
      message: "Selecione um perfil válido.",
    }),
    level: z.enum(["Superadmin", "Admin", "Default"], {
      message: "Selecione um nível de permissão válido.",
    }),
    registrationNumberType: z.enum(["CPF", "MATRICULA"]),
    registrationNumber: z
      .string()
      .min(1, "O número do documento é obrigatório."),
    linkLattes: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.profile === "Listener") {
      if (data.registrationNumberType !== "CPF") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["profile"],
          message: "Ouvintes devem ter um CPF.",
        });
      }
      if (data.registrationNumber.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registrationNumber"],
          message: "O CPF deve ter 11 dígitos.",
        });
      }
    } else if (data.profile === "Presenter" || data.profile === "Professor") {
      if (data.registrationNumberType !== "MATRICULA") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["profile"],
          message: "Apresentadores e Professores devem ter uma Matrícula.",
        });
      }
    }
  });

const labelObrigatorio = (texto: string) => (
  <>
    {texto} <span className="text-error">*</span>
  </>
);

const radioLabel = "flex items-center gap-2 text-sm font-medium";

const EditarUsuario = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { updateUser, findUserById } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = params;
  const { showAlert } = useSweetAlert();
  const [selectedProfile, setSelectedProfile] = useState<
    User["profile"] | null
  >(null);

  const [cpf, setCpf] = useState("");
  const [matricula, setMatricula] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      setIsLoading(true);

      findUserById(id)
        .then((data: User | undefined) => {
          if (data) {
            setUser(data);
            setSelectedProfile(data.profile);

            const type = data.registrationNumberType;
            const number = data.registrationNumber || "";

            if (type === "CPF") {
              setCpf(maskCPF(number));
            } else if (type === "MATRICULA") {
              setMatricula(number.replace(/\D/g, ""));
            }
          } else {
            setUser(null);
          }
        })
        .catch((err) => {
          setUser(null);
          showAlert({
            icon: "error",
            title: "Erro ao processar dados",
            text: err.response?.data?.message || "Ocorreu um erro local.",
          });
        })
        .finally(() => setIsLoading(false));
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const dataToValidate: Record<string, unknown> = {
      name: formData.get("nomeCompleto"),
      email: formData.get("email"),
      profile: formData.get("perfil"),
      level: formData.get("permissao"),
      linkLattes: formData.get("linkLattes"),
    };

    const profileFromForm = dataToValidate.profile as User["profile"];

    const rawDocumentNumber = profileFromForm === "Listener" ? cpf : matricula;

    const docTypeFromProfile =
      profileFromForm === "Listener" ? "CPF" : "MATRICULA";
    const unmaskedDocumentNumber = unmask(rawDocumentNumber || "");

    dataToValidate.registrationNumberType = docTypeFromProfile;
    dataToValidate.registrationNumber = unmaskedDocumentNumber;
    const validationResult = updateUserSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.message}`)
        .join("\n");
      showAlert({
        icon: "error",
        title: "Dados Inválidos",
        text: errors,
      });
      setIsSubmitting(false);
      return;
    }

    const success = await updateUser(
      user?.email as string,
      validationResult.data as unknown as UpdateUserRequest,
    );

    setIsSubmitting(false);

    if (success) {
      router.push("/usuarios");
    }
  };

  // Atualiza o documento aplicando máscara de CPF para ouvintes ou limitando dígitos de matrícula
  const handleDocumentNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = e.target;

    if (selectedProfile === "Listener") {
      // Aplica formatação automática de CPF (000.000.000-00)
      setCpf(maskCPF(value));
    } else {
      // Matrícula acadêmica aceita apenas números (limite de 13 dígitos)
      const digitsOnly = value.replace(/\D/g, "").slice(0, 13);
      setMatricula(digitsOnly);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProfile = e.target.value as User["profile"];
    setSelectedProfile(newProfile);
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <p className="p-6 text-center text-muted">Carregando...</p>
      </ProtectedLayout>
    );
  }

  if (!user || !selectedProfile) {
    return (
      <ProtectedLayout>
        <p className="p-6 text-center text-muted">Usuário não encontrado.</p>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-[30px]">
        <Banner title="Editar Usuário" />
        <div className="self-center">
          <InfoBox
            title="Informação importante"
            message="Apenas os campos que você modificar serão atualizados no sistema. Os campos não alterados permanecerão com seus valores originais."
          />
          <div className="my-[30px] rounded-xl border border-line bg-card p-8 text-center shadow-sm">
            <form className="text-start" onSubmit={handleSubmit}>
              <Campo
                label={labelObrigatorio("Nome completo")}
                htmlFor="nomeCompleto"
                className="mb-3"
              >
                <Input
                  type="text"
                  id="nomeCompleto"
                  name="nomeCompleto"
                  defaultValue={user.name}
                />
              </Campo>

              <Campo
                label={labelObrigatorio(
                  `E-mail ${selectedProfile === "Listener" ? "" : "Institucional"}`.trim(),
                )}
                htmlFor="email"
                className="mb-3"
              >
                <Input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={user.email}
                />
              </Campo>

              <Campo label={labelObrigatorio("Perfil")} className="mb-3">
                <div className="flex flex-col gap-2">
                  {[
                    {
                      id: "perfilApresentador",
                      value: "Presenter",
                      label: "Apresentador (PGCOMP)",
                    },
                    {
                      id: "perfilProfessor",
                      value: "Professor",
                      label: "Professor (PGCOMP)",
                    },
                    {
                      id: "perfilOuvinte",
                      value: "Listener",
                      label: "Ouvinte",
                    },
                  ].map((opcao) => (
                    <label
                      key={opcao.id}
                      className={radioLabel}
                      htmlFor={opcao.id}
                    >
                      <input
                        className="h-4 w-4 accent-brand-orange"
                        type="radio"
                        name="perfil"
                        id={opcao.id}
                        value={opcao.value}
                        checked={selectedProfile === opcao.value}
                        onChange={handleProfileChange}
                      />
                      {opcao.label}
                    </label>
                  ))}
                </div>
              </Campo>

              {/* Campo de Documento: Máscara dinâmica conforme o perfil selecionado */}
              <Campo
                label={labelObrigatorio(
                  selectedProfile === "Listener"
                    ? "CPF"
                    : "Número de Matrícula",
                )}
                htmlFor="documentoNumero"
                className="mb-3"
              >
                <Input
                  type="text"
                  id="documentoNumero"
                  name="registrationNumber"
                  value={selectedProfile === "Listener" ? cpf : matricula}
                  onChange={handleDocumentNumberChange}
                  placeholder={
                    selectedProfile === "Listener"
                      ? "000.000.000-00"
                      : "Digite a Matrícula (13 dígitos)"
                  }
                  maxLength={selectedProfile === "Listener" ? 14 : 13}
                  className={cn(
                    "w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none",
                    "focus:border-brand-blue focus:ring-1 focus:ring-brand-blue",
                  )}
                />
              </Campo>

              <Campo
                label="Link Lattes"
                htmlFor="linkLattes"
                className="mb-3"
              >
                <Input
                  type="text"
                  id="linkLattes"
                  name="linkLattes"
                  defaultValue={user.linkLattes}
                />
              </Campo>

              <Campo
                label={labelObrigatorio("Nível de Permissão")}
                htmlFor="permissao"
                className="mb-3"
              >
                <select
                  className="w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  id="permissao"
                  name="permissao"
                  defaultValue={user.level}
                >
                  <option value="Default">Normal</option>
                  <option value="Admin">Administrador</option>
                  <option value="Superadmin">Super Administrador</option>
                </select>
              </Campo>

              <div className="mt-4 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variante="ghost"
                  onClick={() => router.push("/usuarios")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default EditarUsuario;
