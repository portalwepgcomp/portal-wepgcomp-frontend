"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import {
  PerfilMenu,
  PerfilMenuItem,
  PerfilMenuSection,
} from "../UI/PerfilMenu";
import { usePerfilCertificado } from "./usePerfilCertificado";

interface PerfilOuvinteProps {
  userName: string;
  compact?: boolean;
}

export default function PerfilOuvinte({
  userName,
  compact = false,
}: Readonly<PerfilOuvinteProps>) {
  const { logout } = useContext(AuthContext);
  const { certificateDownload } = usePerfilCertificado();

  return (
    <PerfilMenu
      userName={userName}
      profile="Listener"
      level="Default"
      compact={compact}
    >
      <PerfilMenuSection title="Minha participação">
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
