"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import {
  PerfilMenu,
  PerfilMenuItem,
  PerfilMenuSection,
} from "../UI/PerfilMenu";
import { usePerfilCertificado } from "./usePerfilCertificado";
import { isAdminLevel } from "./perfilLabels";
import { ProfileType, RoleType } from "@/models/user";

interface PerfilAdminProps {
  profile: ProfileType;
  role: RoleType;
  userName: string;
  compact?: boolean;
}

export default function PerfilAdmin({
  profile,
  role,
  userName,
  compact = false,
}: Readonly<PerfilAdminProps>) {
  const { logout } = useContext(AuthContext);
  const { certificateDownload } = usePerfilCertificado();
  const isAdmin = isAdminLevel(role);

  return (
    <PerfilMenu
      userName={userName}
      profile={profile}
      level={role}
      compact={compact}
    >
      <PerfilMenuSection title="Minha participação">
        {profile === "Presenter" && (
          <PerfilMenuItem href="/minha-apresentacao">Submissão</PerfilMenuItem>
        )}
        {profile === "Professor" && (
          <PerfilMenuItem href="/minhas-bancas">Bancas</PerfilMenuItem>
        )}
        <PerfilMenuItem onClick={certificateDownload}>Certificado</PerfilMenuItem>
        <PerfilMenuItem href="/favoritos">Favoritos</PerfilMenuItem>
      </PerfilMenuSection>

      <PerfilMenuSection title="Evento">
        <PerfilMenuItem href="/apresentacoes">Apresentações</PerfilMenuItem>
        <PerfilMenuItem href="/sessoes">Sessões</PerfilMenuItem>
        <PerfilMenuItem href="/criterios">Critérios</PerfilMenuItem>
        <PerfilMenuItem href="/premiacao">Premiação</PerfilMenuItem>
        <PerfilMenuItem href="/premiacao/melhores-avaliadores">
          Avaliadores
        </PerfilMenuItem>
      </PerfilMenuSection>

      {isAdmin && (
        <PerfilMenuSection title="Administração">
          <PerfilMenuItem href="/edicoes">Eventos</PerfilMenuItem>
          <PerfilMenuItem href="/usuarios">Usuários</PerfilMenuItem>
          <PerfilMenuItem href="/gerenciamento">Gerenciamento</PerfilMenuItem>
        </PerfilMenuSection>
      )}

      <PerfilMenuSection title="Conta">
        <PerfilMenuItem href="/home" onClick={logout} danger>
          Sair
        </PerfilMenuItem>
      </PerfilMenuSection>
    </PerfilMenu>
  );
}
