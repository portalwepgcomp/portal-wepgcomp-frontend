"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import {
  PerfilMenu,
  PerfilMenuItem,
  PerfilMenuSection,
} from "../UI/PerfilMenu";
import { usePerfilCertificado } from "./usePerfilCertificado";

interface PerfilProfessorProps {
  userName: string;
  compact?: boolean;
}

export default function PerfilProfessor({
  userName,
  compact = false,
}: Readonly<PerfilProfessorProps>) {
  const { logout } = useContext(AuthContext);
  const { certificateDownload } = usePerfilCertificado();

  return (
    <PerfilMenu
      userName={userName}
      profile="Professor"
      level="Default"
      compact={compact}
    >
      <PerfilMenuSection title="Minha participação">
        <PerfilMenuItem href="/minhas-bancas">Bancas</PerfilMenuItem>
        <PerfilMenuItem onClick={certificateDownload}>Certificado</PerfilMenuItem>
        <PerfilMenuItem href="/favoritos">Favoritos</PerfilMenuItem>
      </PerfilMenuSection>
      <PerfilMenuSection title="Conta">
        <PerfilMenuItem href="/home" onClick={logout} danger>
          Sair
        </PerfilMenuItem>
      </PerfilMenuSection>
    </PerfilMenu>
  );
}
