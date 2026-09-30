"use client";

import { FormLogin } from "@/components/Forms/Login/FormLogin";
import { useEdicao } from "@/hooks/useEdicao";
import { formatDateEvent } from "@/utils/formatDate";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export function LoginContent() {
  const { Edicao } = useEdicao();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F4F5F7] px-4 py-10">
      <div className="flex w-full max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-30px_rgba(14,31,107,0.35)] max-[820px]:flex-col">
        {/* Painel de identidade */}

        <div className="relative flex flex-1 flex-col justify-between gap-10 overflow-hidden bg-[linear-gradient(160deg,#0E1F6B_0%,#1B39B8_45%,#4B0FA8_100%)] px-11 max-sm:px-5 py-12 max-sm:py-6 text-white">
          {/* camadas decorativas */}

          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/5 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-32 -right-16 size-80 rounded-full border-[44px] border-[#F4A900]/15" />

          <div className="pointer-events-none absolute left-1/2 top-1/3 size-40 -translate-x-1/2 rounded-full bg-[#4B0FA8]/30 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/70">
              Evento UFBA
            </span>

            <h1 className="mt-5 font-['Space_Grotesk',sans-serif] text-[clamp(38px,5vw,56px)] font-bold leading-[0.95] tracking-[-0.02em] text-white max-sm:text-2xl">
              {Edicao?.name || "WEPGCOMP"}
            </h1>

            <div className="mt-5 h-1.5 w-16 rounded-full bg-[#F4A900]" />
          </div>

          <div className="relative z-10 grid gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F4A900]/15 text-[#F4A900]">
                <Calendar className="size-[18px]" aria-hidden="true" />
              </span>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Data
                </p>

                <p className="text-sm font-medium text-white">
                  {formatDateEvent(Edicao?.startDate, Edicao?.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F4A900]/15 text-[#F4A900]">
                <MapPin className="size-[18px]" aria-hidden="true" />
              </span>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Local
                </p>

                <p className="text-sm font-medium text-white">
                  {Edicao?.location || "A definir"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}

        <div className="flex flex-1 flex-col justify-center gap-1 px-12 py-10 max-[500px]:px-6">
          <h2 className="font-['Space_Grotesk',sans-serif] text-[27px] tracking-[-0.01em] text-black">
            Acesse sua conta
          </h2>

          <p className="mb-8 text-base text-[#5A5F6B]">
            Use o e-mail cadastrado na inscrição.
          </p>

          <div className="flex justify-center">
            <FormLogin />
          </div>

          <p className="mt-[26px] border-t border-[#D9DCE3] pt-5 text-center text-sm text-[#5A5F6B]">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-[#4B0FA8] no-underline hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#4B0FA8] focus-visible:outline-offset-3"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
