"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordEyeProps {
  color?: string;
  isOff?: boolean;
}

/**
 * Ícone visual de alternância de senha baseado em Lucide.
 * Mantido para compatibilidade retroativa com formulários que consom o ícone isoladamente.
 */
export default function PasswordEye({ color = "currentColor", isOff = false }: Readonly<PasswordEyeProps>) {
  if (isOff) {
    return <EyeOff className="h-5 w-5" style={{ color }} aria-hidden="true" />;
  }
  return <Eye className="h-5 w-5" style={{ color }} aria-hidden="true" />;
}