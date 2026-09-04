"use client";

import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import ListaSessoes from "@/features/sessoes/components/ListaSessoes";

export default function Sessoes() {
  return (
    <ProtectedLayout>
      <ListaSessoes />
    </ProtectedLayout>
  );
}
