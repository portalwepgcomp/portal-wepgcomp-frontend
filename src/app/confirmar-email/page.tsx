import type { Metadata } from "next";
import { ConfirmarEmail } from "@/components/ConfirmarEmail/ConfirmarEmail";

export const metadata: Metadata = {
  title: "Confirmar e-mail",
  robots: {
    index: false,
    follow: false,
  },
};

interface ConfirmarEmailPageProps {
  searchParams: { token?: string | string[] };
}

export default function ConfirmarEmailPage({
  searchParams,
}: Readonly<ConfirmarEmailPageProps>) {
  const { token } = searchParams;

  return <ConfirmarEmail token={Array.isArray(token) ? token[0] : token} />;
}
