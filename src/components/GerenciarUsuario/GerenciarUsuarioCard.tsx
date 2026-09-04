"use client";

import { cn } from "@/utils/cn";
import GerenciarUsuarioAcoes from "./GerenciarUsuarioAcoes";
import GerenciarUsuarioBadges from "./GerenciarUsuarioBadges";
import {
  controlSelectBase,
  permissionBadgeClasses,
  statusSelectClasses,
  type PermissaoUsuario,
  type StatusUsuario,
} from "./constants";
import { obterPermissaoUsuario, obterStatusUsuario } from "./usuarioUtils";

interface GerenciarUsuarioCardProps {
  usuario: User;
  usuarioAtual: UserProfile | null | undefined;
  edicaoAtiva: boolean;
  carregandoAcoes: boolean;
  onAlternarAtivo: (id: string, ativo: boolean) => void;
  onExcluir: (id: string) => void;
  onAprovarProfessor: (id: string) => void;
  onAprovarApresentador: (id: string) => void;
  onPromoverAdmin: (id: string) => void;
  onPromoverSuperadmin: (id: string) => void;
  onRebaixar: (id: string) => void;
}

function SecaoCard({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-[#f0f0f0] bg-white p-4 transition-all duration-300 max-md:min-h-[80px] max-sm:min-h-[70px] max-sm:p-3">
      <div className="mb-3 flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-[#495057] max-sm:mb-2 max-sm:text-[0.7rem]">
        {titulo}
      </div>
      {children}
    </div>
  );
}

export default function GerenciarUsuarioCard({
  usuario,
  usuarioAtual,
  edicaoAtiva,
  carregandoAcoes,
  onAlternarAtivo,
  onExcluir,
  onAprovarProfessor,
  onAprovarApresentador,
  onPromoverAdmin,
  onPromoverSuperadmin,
  onRebaixar,
}: GerenciarUsuarioCardProps) {
  const status = obterStatusUsuario(usuario) as StatusUsuario;
  const permissao = obterPermissaoUsuario(usuario) as PermissaoUsuario;

  const pendente =
    (usuario.profile === "Professor" && !usuario.isTeacherActive) ||
    (usuario.profile === "Presenter" && !usuario.isPresenterActive);

  return (
    <div
      className={cn(
        "relative box-border flex w-full gap-8 overflow-hidden rounded-xl border border-[#f0f0f0]",
        "bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-200",
        "max-md:flex-col max-md:gap-4 max-md:p-4 max-sm:gap-3 max-sm:p-3.5",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-4">
          <div className="mb-1 break-words text-xl font-semibold text-[#212529]">
            {usuario.name}
          </div>
          <div className="break-words text-sm text-[#6c757d]">{usuario.email}</div>
        </div>
        <GerenciarUsuarioBadges user={usuario} />
      </div>

      <div className="grid min-h-[120px] flex-[2] grid-cols-3 items-stretch gap-4 max-md:min-h-0 max-md:grid-cols-1 max-md:gap-3 max-sm:gap-2">
        <SecaoCard titulo="Status">
          <select
            className={cn(controlSelectBase, statusSelectClasses[status])}
            disabled={!edicaoAtiva || carregandoAcoes}
            onChange={(e) =>
              onAlternarAtivo(
                usuario.id,
                e.target.value === "ATIVO" ||
                  e.target.value === "ATIVO_PENDENTE",
              )
            }
            value={status}
          >
            {pendente ? (
              <>
                <option value="ATIVO_PENDENTE">ATIVO PENDENTE</option>
                <option value="INATIVO">INATIVO</option>
              </>
            ) : (
              <>
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </>
            )}
          </select>
        </SecaoCard>

        <SecaoCard titulo="Permissão">
          <span className={permissionBadgeClasses[permissao]}>{permissao}</span>
        </SecaoCard>

        <SecaoCard titulo="Ações">
          <GerenciarUsuarioAcoes
            usuario={usuario}
            usuarioAtual={usuarioAtual}
            edicaoAtiva={edicaoAtiva}
            carregando={carregandoAcoes}
            onExcluir={onExcluir}
            onAprovarProfessor={onAprovarProfessor}
            onAprovarApresentador={onAprovarApresentador}
            onPromoverAdmin={onPromoverAdmin}
            onPromoverSuperadmin={onPromoverSuperadmin}
            onRebaixar={onRebaixar}
          />
        </SecaoCard>
      </div>

      {carregandoAcoes && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent text-[#007bff]"
            role="status"
          >
            <span className="sr-only">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
