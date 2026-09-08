"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordEyeProps {
  color?: string;
  isOff?: boolean;
}

export default function PasswordEye({ color = "currentColor", isOff = false }: Readonly<PasswordEyeProps>) {
  if (isOff) {
    return <EyeOff className="h-5 w-5" style={{ color }} aria-hidden="true" />;
  }
  return <Eye className="h-5 w-5" style={{ color }} aria-hidden="true" />;
}
