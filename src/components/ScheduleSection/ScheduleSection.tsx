"use client";

import React from "react";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

dayjs.extend(utc);

import { useEdicao } from "@/hooks/useEdicao";
import { useSessoesQuery } from "@/features/sessoes/hooks/useSessoesQuery";
import { useRoomsQuery } from "@/features/sessoes/hooks/useRoomsQuery";

import { useActiveEdition } from "@/hooks/useActiveEdition";
import Button from "@/components/UI/Button";
import IndicadorDeCarregamento from "../IndicadorDeCarregamento/IndicadorDeCarregamento";
import LinhaAgenda from "./LinhaAgenda";
import { Presentation } from "@/models/presentation";
import { PresentationBlock } from "@/models/session";

export default function ScheduleSection() {
  const { Edicao } = useEdicao();
  const { selectEdition } = useActiveEdition();
  const { ensureActiveEdition } = useActiveEdition();

  const { sessoes, isLoading: isSessoesLoading } = useSessoesQuery(Edicao?.id);
  const { data: rooms, isLoading: isRoomsLoading } = useRoomsQuery(Edicao?.id);
  const roomsList = rooms ?? [];

  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const isLoading = isRoomsLoading || isSessoesLoading;

  useEffect(() => {
    dayjs.locale("pt-br");

    if (Edicao?.startDate && Edicao?.endDate) {
      const generatedDates = generateDatesBetween(
        Edicao.startDate,
        Edicao.endDate,
      );

      setDates(generatedDates);

      const today = dayjs.utc().format("YYYY-MM-DD");
      const todayInsideEvent = generatedDates.includes(today);

      setSelectedDate(todayInsideEvent ? today : generatedDates[0]);
    }
  }, [Edicao?.id, Edicao?.startDate, Edicao?.endDate, selectEdition.year]);

  const hasAttemptedActiveRef = useRef(false);
  useEffect(() => {
    if (!Edicao?.id && !hasAttemptedActiveRef.current) {
      hasAttemptedActiveRef.current = true;
      ensureActiveEdition?.();
    }
  }, [Edicao?.id, ensureActiveEdition]);

  function generateDatesBetween(startDate: string, endDate: string): string[] {
    const datesArray: string[] = [];
    let currentDate = dayjs.utc(startDate).startOf("day");
    const finalDate = dayjs.utc(endDate).startOf("day");

    while (!currentDate.isAfter(finalDate, "day")) {
      datesArray.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }
    return datesArray;
  }

  function changeDate(date: string) {
    setSelectedDate(date);
  }

  function formatDateLabel(date: string) {
    if (!date) return "";
    const parts = date.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return date;
    }
    const [ano, mes, dia] = parts;
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
  }

  return (
    <div
      id="Programacao"
      className="mx-60 px-0 py-5 pb-[3.125rem] max-[980px]:mx-auto max-[980px]:w-full"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-10 max-md:px-4 max-md:py-5">
        <div className="mb-8">
          <h1 className="m-0 text-center text-[42px] font-bold text-brand-navy max-md:text-[32px]">
            Programação
          </h1>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-4">
          {dates.map((date) => (
            <Button size="lg"
              key={date}
              type="button"
              variante={selectedDate === date ? "secondary" : "outline"}
              aria-pressed={selectedDate === date}
              onClick={() => changeDate(date)}
            >
              {formatDateLabel(date)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <IndicadorDeCarregamento />
        ) : (
          <div className="flex flex-col gap-10 py-4 max-md:mx-auto max-md:w-[95%]">
            {roomsList.map((room, roomIndex) => (
              <React.Fragment key={room.id || roomIndex}>
                <div className="rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light px-8 py-5 text-center shadow-md transition hover:-translate-y-0.5 hover:shadow-lg max-md:w-full">
                  <h3 className="m-0 text-[1.3rem] font-bold tracking-tight text-white">
                    {room.name}
                  </h3>
                </div>

                <div className="ml-6 flex flex-col gap-5 border-l-[3px] border-brand-blue/30 py-4 pl-8 max-md:ml-6 max-md:px-2 max-md:py-1">
                  {(() => {
                    const filteredSessions = sessoes
                      ?.filter(
                        (sessao) =>
                          dayjs.utc(sessao.startTime).format("YYYY-MM-DD") ===
                          selectedDate,
                      )
                      ?.filter(
                        (sessao) =>
                          sessao.type === "General" || sessao.roomId === room.id,
                      );

                    const sortedSessions = filteredSessions
                      ? [...filteredSessions].sort(
                          (a, b) =>
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime(),
                        )
                      : [];

                    const groupedByTitle = sortedSessions
                      ?.filter(
                        (sessao) =>
                          sessao.type !== "General" &&
                          sessao.title !== undefined,
                      )
                      ?.reduce(
                        (acc, sessao) => {
                          if (sessao.title !== undefined) {
                            acc[sessao.title] = acc[sessao.title] || [];
                            acc[sessao.title].push(sessao);
                          }
                          return acc;
                        },
                        {} as Record<string, PresentationBlock[]>,
                      );

                    return (
                      <>
                        {sortedSessions?.map((item, index) => {
                          if (item.type === "General") {
                            return (
                              <div
                                key={index + item.id}
                                className="flex items-center gap-6 transition hover:translate-x-1.5 hover:opacity-95 max-md:ml-2 max-md:gap-4"
                              >
                                <LinhaAgenda
                                  type="GeneralSession"
                                  presentation={item}
                                />
                              </div>
                            );
                          }

                          if (
                            item.title &&
                            groupedByTitle?.[item.title] &&
                            groupedByTitle[item.title][0].id === item.id
                          ) {
                            const group = groupedByTitle[item.title];
                            return (
                              <div key={item.title} className="mb-8">
                                <h2 className="mb-2.5 rounded-md bg-[#e0e0e0] px-3 py-1.5 text-[1.1rem] font-semibold text-[#333]">
                                  {item.title}
                                </h2>
                                {group.flatMap((sess, sessIndex) =>
                                  (sess.presentations ? [...sess.presentations] : [])
                                    .sort(
                                      (a, b) =>
                                        (a.positionWithinBlock ?? 0) -
                                        (b.positionWithinBlock ?? 0),
                                    )
                                    .map((pres: Presentation) => (
                                      <div
                                        key={sessIndex + pres.id}
                                        className="ml-6 flex items-center gap-4 transition hover:translate-x-1.5 hover:opacity-95 max-md:ml-2 max-md:gap-4"
                                      >
                                        <LinhaAgenda
                                          presentation={pres}
                                          type="PresentationSession"
                                        />
                                      </div>
                                    )),
                                )}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </>
                    );
                  })()}

                  {!sessoes?.some(
                    (sessao) =>
                      dayjs.utc(sessao.startTime).format("YYYY-MM-DD") ===
                        selectedDate &&
                      sessao.roomId === room.id,
                  ) && (
                    <div className="flex flex-col items-center gap-4 py-12 text-[#777]">
                      <Image
                        src="/assets/images/empty_box.svg"
                        alt="Lista vazia"
                        width={90}
                        height={90}
                      />
                      <p className="text-base font-medium">
                        Essa lista ainda está vazia
                      </p>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
