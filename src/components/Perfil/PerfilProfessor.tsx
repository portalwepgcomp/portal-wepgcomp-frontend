"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { PerfilMenu, PerfilMenuItem } from "../UI/PerfilMenu";
import { usePerfilCertificado } from "./usePerfilCertificado";

export default function PerfilProfessor() {
  const { logout } = useContext(AuthContext);
  const { certificateDownload } = usePerfilCertificado();

  return (
    <PerfilMenu>
      <PerfilMenuItem href="/minhas-bancas">Bancas</PerfilMenuItem>
      <PerfilMenuItem onClick={certificateDownload}>Certificado</PerfilMenuItem>
      <PerfilMenuItem href="/favoritos">Favoritos</PerfilMenuItem>
      <PerfilMenuItem href="/home" onClick={logout}>
        Sair
      </PerfilMenuItem>
    </PerfilMenu>
  );
}
