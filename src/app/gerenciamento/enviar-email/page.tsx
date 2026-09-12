"use client";

import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { Campo, Input, Textarea } from "@/components/UI/Input";
import Spinner from "@/components/UI/Spinner";
import { useSweetAlert } from "@/hooks/useAlert";
import { useEmails } from "@/hooks/useEmail";
import { useUsers } from "@/hooks/useUsers";
import { ArrowLeft, Mail, Send, UserCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileType, RoleType, SubprofileType } from "@/models/user";
import { getErrorMessage } from "@/utils/error";

type GroupType = "professors" | "admins" | "presenters" | "listeners" | "all";

interface GroupConfig {
  label: string;
  profiles?: ProfileType[];
  roles?: RoleType[];
  subprofiles?: SubprofileType[];
}

const GROUPS: Record<GroupType, GroupConfig> = {
  professors: {
    label: "Professores",
    profiles: ["Professor"],
  },
  admins: {
    label: "Admins",
    roles: ["Admin"],
  },
  presenters: {
    label: "Apresentadores",
    profiles: ["Presenter"],
  },
  listeners: {
    label: "Ouvintes",
    profiles: ["Listener"],
  },
  all: {
    label: "Todos",
  },
};

const SendEmail = () => {
  const router = useRouter();
  const { showAlert } = useSweetAlert();
  const { userList, getUsers, loadingUserList } = useUsers();

  const [selectedGroup, setSelectedGroup] = useState<GroupType | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { sendGroupEmail } = useEmails();

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    const groupConfig = GROUPS[selectedGroup];

    if (selectedGroup === "all") {
      getUsers({});
    } else {
      getUsers({
        profiles: groupConfig.profiles?.[0],
        roles: groupConfig.roles?.[0],
        subprofiles: groupConfig.subprofiles?.[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const recipientCount = userList?.length || 0;

  const handleSendEmail = async () => {
    if (!selectedGroup) {
      showAlert({
        icon: "error",
        title: "Erro de Validação",
        text: "Por favor, selecione um grupo de destinatários.",
      });
      return;
    }

    if (!subject.trim()) {
      showAlert({
        icon: "error",
        title: "Erro de Validação",
        text: "Por favor, preencha o assunto do e-mail.",
      });
      return;
    }

    if (!message.trim()) {
      showAlert({
        icon: "error",
        title: "Erro de Validação",
        text: "Por favor, preencha a mensagem do e-mail.",
      });
      return;
    }

    if (recipientCount === 0) {
      showAlert({
        icon: "warning",
        title: "Sem Destinatários",
        text: "Não há usuários no grupo selecionado.",
      });
      return;
    }

    setIsSending(true);

    try {
      const groupConfig = GROUPS[selectedGroup];

      const emailData = {
        subject,
        message,
        filters: {
          profiles: groupConfig.profiles,
          roles: groupConfig.roles,
          subprofiles: groupConfig.subprofiles,
        },
      };

      await sendGroupEmail(emailData);
    } catch (err: unknown) {
      showAlert({
        icon: "error",
        title: "Erro ao Enviar E-mail",
        text: getErrorMessage(err, "Ocorreu um erro ao enviar o e-mail."),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-card px-8 py-6 shadow-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h1 className="m-0 text-xl font-semibold text-foreground">Portal WePGCOMP</h1>
              <p className="m-0 text-sm text-muted">Envio de E-mails</p>
            </div>
          </div>
          <Button size="lg" variante="outline" onClick={() => router.back()}>
            <ArrowLeft  />
            Voltar
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-12">
        <p className="mb-8 text-base text-muted">
          Envie mensagens para grupos específicos de usuários
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card
            title="Compor E-mail"
            subtitle="Preencha os detalhes da mensagem que será enviada"
            icon={<Send className="h-5 w-5" />}
          >
            <Campo label="Destinatários">
              <select
                className="w-full rounded-md border border-[#d9dce0] bg-white px-3 py-2.5 text-[0.9375rem] leading-normal text-foreground transition hover:border-[#bdc1c6] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                value={selectedGroup}
                onChange={(e) =>
                  setSelectedGroup(e.target.value as GroupType | "")
                }
              >
                <option value="" disabled>
                  Selecione um grupo
                </option>
                {Object.entries(GROUPS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Assunto">
              <Input
                type="text"
                placeholder="Digite o assunto do e-mail"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Campo>

            <Campo label="Mensagem">
              <Textarea
                placeholder="Digite a mensagem do e-mail"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
              />
            </Campo>

            <Button size="lg" variante="primary"
              larguraTotal
              onClick={handleSendEmail}
              disabled={!selectedGroup || !subject || !message || isSending || loadingUserList}
            >
              {isSending ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send  />
                  Enviar E-mail para {recipientCount} destinatário(s)
                </>
              )}
            </Button>
          </Card>

          <Card
            title="Destinatários"
            subtitle="Selecione um grupo para ver os destinatários"
            icon={<Users className="h-5 w-5" />}
          >
            {!selectedGroup ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-6 rounded-full bg-muted-light p-6">
                  <UserCircle className="h-12 w-12 text-muted" />
                </div>
                <p className="text-muted">
                  Selecione um grupo para visualizar os destinatários
                </p>
              </div>
            ) : loadingUserList ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Spinner className="mb-6" />
                <p className="text-muted">Carregando destinatários...</p>
              </div>
            ) : recipientCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-6 rounded-full bg-muted-light p-6">
                  <UserCircle className="h-12 w-12 text-muted" />
                </div>
                <p className="text-muted">
                  Nenhum usuário encontrado neste grupo
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-md border border-primary/20 bg-primary-light p-4">
                  <p className="m-0 text-sm font-medium text-foreground">
                    Total: <strong className="font-bold text-primary">{recipientCount}</strong> destinatário(s)
                  </p>
                </div>

                <div className="max-h-[480px] overflow-y-auto pr-4">
                  <div className="flex flex-col gap-2">
                    {userList.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-md border border-line bg-primary/[0.05] p-6 transition hover:border-primary/40 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 rounded-full bg-primary-light p-2">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 truncate text-sm font-medium text-foreground">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SendEmail;
