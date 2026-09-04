"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useModal } from "@/context/ModalProvider";
import ModalMelhoresAvaliadores from "../Modals/ModalMelhoresAvaliadores/ModalMelhoresAvaliadores";
import ModalCriterios from "../Modals/ModalCriterios/ModalCriterios";
import { PerfilMenu, PerfilMenuItem } from "../UI/PerfilMenu";
import { usePerfilCertificado } from "./usePerfilCertificado";
import { createPortal } from "react-dom";

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
  const { open: openAvaliadores } = useModal("escolherAvaliadorModal");
  const { open: openCriterios } = useModal("criteriosModal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <PerfilMenu>
        <PerfilMenuItem href="/apresentacoes">Apresentações</PerfilMenuItem>
        <PerfilMenuItem onClick={() => openAvaliadores()}>
          Avaliadores
        </PerfilMenuItem>
        {profile === "Presenter" && (
          <PerfilMenuItem href="/minha-apresentacao">Submissão</PerfilMenuItem>
        )}
        {profile === "Professor" && (
          <PerfilMenuItem href="/minhas-bancas">Bancas</PerfilMenuItem>
        )}
        <PerfilMenuItem onClick={certificateDownload}>Certificado</PerfilMenuItem>
        <PerfilMenuItem onClick={() => openCriterios()}>Critérios</PerfilMenuItem>
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
      {mounted &&
        createPortal(
          <>
            <ModalMelhoresAvaliadores />
            <ModalCriterios />
          </>,
          document.body,
        )}
    </>
  );
}
