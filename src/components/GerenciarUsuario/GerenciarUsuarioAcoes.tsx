"use client";

import { useRouter } from "next/navigation";
import Button, { VarianteBotao } from "@/components/UI/Button";
import { User, UserProfile } from "@/models/user";

interface GerenciarUsuarioAcoesProps {
  usuario: User;
  usuarioAtual: UserProfile | null | undefined;
  edicaoAtiva: boolean;
  carregando: boolean;
  onExcluir: (id: string) => void;
  onAprovarProfessor: (id: string) => void;
  onAprovarApresentador: (id: string) => void;
  onPromoverAdmin: (id: string) => void;
  onPromoverSuperadmin: (id: string) => void;
  onRebaixar: (id: string) => void;
}

function BotaoAcao({
  onClick,
  disabled,
  title,
  rotulo,
  variante,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  rotulo: string;
  variante: VarianteBotao;
}) {
  return (
    <Button size="lg"
      type="button"
      variante={variante}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span className="hidden md:inline">{rotulo}</span>
      <span className="inline md:hidden" aria-hidden>
        •
      </span>
    </Button>
  );
}

export default function GerenciarUsuarioAcoes({
  usuario,
  usuarioAtual,
  edicaoAtiva,
  carregando,
  onExcluir,
  onAprovarProfessor,
  onAprovarApresentador,
  onPromoverAdmin,
  onPromoverSuperadmin,
  onRebaixar,
}: GerenciarUsuarioAcoesProps) {
  const router = useRouter();
  const desabilitado = !edicaoAtiva || carregando;

  const isSuperadmin = usuarioAtual?.level === "Superadmin";
  const isAdmin =
    usuarioAtual?.level === "Admin" || usuarioAtual?.level === "Superadmin";
  const isSelf = usuario.id === usuarioAtual?.id;

  const acoes: React.ReactNode[] = [];

  acoes.push(
    <BotaoAcao
      key="delete"
      rotulo="Excluir Usuário"
      title="Excluir Usuário"
      variante="danger"
      onClick={() => onExcluir(usuario.id)}
      disabled={desabilitado}
    />,
  );

  if (
    isAdmin &&
    usuario.profile === "Professor" &&
    usuario.isActive &&
    !usuario.isTeacherActive
  ) {
    acoes.push(
      <BotaoAcao
        key="approve-teacher"
        rotulo="Aprovar Professor"
        title="Aprovar Professor"
        variante="primary"
        onClick={() => onAprovarProfessor(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (
    isAdmin &&
    usuario.profile === "Presenter" &&
    usuario.isActive &&
    !usuario.isPresenterActive
  ) {
    acoes.push(
      <BotaoAcao
        key="approve-presenter"
        rotulo="Aprovar Apresentador"
        title="Aprovar Apresentador"
        variante="primary"
        onClick={() => onAprovarApresentador(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (isSuperadmin) {
    acoes.push(
      <BotaoAcao
        key="edit"
        rotulo="Editar usuário"
        title="Editar usuário"
        variante="secondary"
        onClick={() => router.push(`/usuarios/${usuario.id}/editar`)}
        disabled={desabilitado}
      />,
    );
  }

  if (isSuperadmin && !usuario.isAdmin && !usuario.isSuperadmin && !isSelf) {
    acoes.push(
      <BotaoAcao
        key="promote-admin"
        rotulo="Promover a Admin"
        title="Promover a Admin"
        variante="secondary"
        onClick={() => onPromoverAdmin(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (
    isSuperadmin &&
    usuario.isAdmin &&
    !usuario.isSuperadmin &&
    !isSelf
  ) {
    acoes.push(
      <BotaoAcao
        key="promote-superadmin"
        rotulo="Promover a Superadmin"
        title="Promover a Superadmin"
        variante="secondary"
        onClick={() => onPromoverSuperadmin(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (
    isSuperadmin &&
    !isSelf &&
    (usuario.isAdmin || usuario.isSuperadmin)
  ) {
    const rotulo = usuario.isSuperadmin
      ? "REBAIXAR PARA ADMIN"
      : "REBAIXAR PARA PADRÃO";
    acoes.push(
      <BotaoAcao
        key="demote"
        rotulo={rotulo}
        title={rotulo}
        variante="danger"
        onClick={() => onRebaixar(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (acoes.length === 0) {
    return (
      <div className="text-center text-xs text-[#6c757d]">
        Nenhuma ação disponível
      </div>
    );
  }

  return <div className="flex h-full flex-col justify-center gap-2">{acoes}</div>;
}
