"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { actionBtnBase } from "./constants";
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
  onRebaixar: (id: string) => void;
}

function BotaoAcao({
  onClick,
  disabled,
  title,
  rotulo,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  rotulo: string;
  className: string;
}) {
  return (
    <button
      type="button"
      className={cn(actionBtnBase, className)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span className="hidden md:inline">{rotulo}</span>
      <span className="inline md:hidden" aria-hidden>
        •
      </span>
    </button>
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
  onRebaixar,
}: GerenciarUsuarioAcoesProps) {
  const router = useRouter();
  const desabilitado = !edicaoAtiva || carregando;

  const isAdmin = usuarioAtual?.level === "Admin";
  const isSelf = usuario.id === usuarioAtual?.id;

  const acoes: React.ReactNode[] = [];

  acoes.push(
    <BotaoAcao
      key="delete"
      rotulo="Excluir Usuário"
      title="Excluir Usuário"
      className="border-red-500 bg-gradient-to-br from-red-500 to-red-400 text-white hover:from-red-600 hover:to-red-500"
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
        className="border-[#4caf50] bg-gradient-to-br from-[#4caf50] to-[#66bb6a] text-white hover:from-[#388e3c] hover:to-[#4caf50]"
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
        className="border-[#4caf50] bg-gradient-to-br from-[#4caf50] to-[#66bb6a] text-white hover:from-[#388e3c] hover:to-[#4caf50]"
        onClick={() => onAprovarApresentador(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (isAdmin) {
    acoes.push(
      <BotaoAcao
        key="edit"
        rotulo="Editar usuário"
        title="Editar usuário"
        className="border-[#00bcd4] bg-gradient-to-br from-[#00bcd4] to-[#4dd0e1] text-white hover:from-[#0097a7] hover:to-[#00bcd4]"
        onClick={() => router.push(`/usuarios/${usuario.id}/editar`)}
        disabled={desabilitado}
      />,
    );
  }

  if (isAdmin && usuario.level === "Default" && !isSelf) {
    acoes.push(
      <BotaoAcao
        key="promote-admin"
        rotulo="Promover a Admin"
        title="Promover a Admin"
        className="border-[#2196f3] bg-gradient-to-br from-[#2196f3] to-[#42a5f5] text-white hover:from-[#1976d2] hover:to-[#2196f3]"
        onClick={() => onPromoverAdmin(usuario.id)}
        disabled={desabilitado}
      />,
    );
  }

  if (isAdmin && usuario.level === "Admin" && !isSelf) {
    const rotulo = "REBAIXAR PARA PADRÃO";
    acoes.push(
      <BotaoAcao
        key="demote"
        rotulo={rotulo}
        title={rotulo}
        className="border-[#9e9e9e] bg-gradient-to-br from-[#9e9e9e] to-[#bdbdbd] text-white hover:from-[#757575] hover:to-[#9e9e9e]"
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
