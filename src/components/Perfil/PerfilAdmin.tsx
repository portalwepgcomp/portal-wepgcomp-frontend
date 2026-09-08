"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { PerfilMenu, PerfilMenuItem } from "../UI/PerfilMenu";
import { usePerfilCertificado } from "./usePerfilCertificado";
import { ProfileType, RoleType } from "@/models/user";

interface PerfilAdminProps {
  profile: ProfileType;
  role: RoleType;
}

export default function PerfilAdmin({
  profile,
  role,
}: Readonly<PerfilAdminProps>) {
  const { logout } = useContext(AuthContext);
  const { certificateDownload } = usePerfilCertificado();

  return (
    <PerfilMenu>
      <PerfilMenuItem href="/apresentacoes">Apresentações</PerfilMenuItem>
      <PerfilMenuItem href="/premiacao/melhores-avaliadores">
        Avaliadores
      </PerfilMenuItem>
      {profile === "Presenter" && (
        <PerfilMenuItem href="/minha-apresentacao">Submissão</PerfilMenuItem>
      )}
      {profile === "Professor" && (
        <PerfilMenuItem href="/minhas-bancas">Bancas</PerfilMenuItem>
      )}
      <PerfilMenuItem onClick={certificateDownload}>Certificado</PerfilMenuItem>
      <PerfilMenuItem href="/criterios">Critérios</PerfilMenuItem>
      {role === "Superadmin" && (
        <PerfilMenuItem href="/edicoes">Eventos</PerfilMenuItem>
      )}
      <PerfilMenuItem href="/favoritos">Favoritos</PerfilMenuItem>
      {role === "Superadmin" && (
        <PerfilMenuItem href="/gerenciamento">Gerenciamento</PerfilMenuItem>
      )}
      {role === "Superadmin" && (
        <PerfilMenuItem href="/usuarios">Usuários</PerfilMenuItem>
      )}
      <PerfilMenuItem href="/premiacao">Premiação</PerfilMenuItem>
      <PerfilMenuItem href="/sessoes">Sessões</PerfilMenuItem>
      <PerfilMenuItem href="/home" onClick={logout}>
        Sair
      </PerfilMenuItem>
    </PerfilMenu>
  );
}
