"use client";

import { Suspense } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout/protectedLayout";
import IndicadorDeCarregamento from "@/components/IndicadorDeCarregamento/IndicadorDeCarregamento";
import PaginaLogsErro from "@/features/logs-erro/components/PaginaLogsErro";

export default function LogsErroPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<IndicadorDeCarregamento />}>
        <PaginaLogsErro />
      </Suspense>
    </ProtectedLayout>
  );
}
