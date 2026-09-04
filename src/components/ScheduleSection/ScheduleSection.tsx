"use client";

import React from "react";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

dayjs.extend(utc);

import PresentationModal from "../Modals/ModalApresentação/PresentationModal";
import Modal from "../UI/Modal/Modal";

import { useEdicao } from "@/hooks/useEdicao";
import { useSession } from "@/hooks/useSession";

import { useActiveEdition } from "@/hooks/useActiveEdition";
import { cn } from "@/utils/cn";
import IndicadorDeCarregamento from "../IndicadorDeCarregamento/IndicadorDeCarregamento";
import LinhaAgenda from "./LinhaAgenda";

export default function ScheduleSection() {
  const {
    listSessions,
    sessoesList,
    listRooms,
    roomsList,
    loadingRoomsList,
    loadingSessoesList,
  } = useSession();
  const { Edicao } = useEdicao();
  const { selectEdition } = useActiveEdition();
  const { ensureActiveEdition } = useActiveEdition();

  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const openModal = useRef<HTMLButtonElement | null>(null);
  const [modalContent, setModalContent] = useState<Presentation>(
    {} as Presentation,
  );

  const isLoading = loadingRoomsList || loadingSessoesList;

  useEffect(() => {
    dayjs.locale("pt-br");
  }, []);

  useEffect(() => {
    if (!Edicao?.id) {
      ensureActiveEdition?.();
    }
  }, [Edicao?.id, ensureActiveEdition]);

  useEffect(() => {
    if (Edicao?.id && Edicao?.startDate && Edicao?.endDate) {
      listSessions(Edicao?.id);

      const generatedDates = generateDatesBetween(
        Edicao.startDate,
        Edicao.endDate,
      );

      setDates(generatedDates);

      const today = dayjs().format("YYYY-MM-DD");
      const todayInsideEvent = generatedDates.includes(today);

      setSelectedDate(todayInsideEvent ? today : generatedDates[0]);
    }

    if (Edicao?.id) listRooms(Edicao?.id);
  }, [Edicao?.id, selectEdition]);

  function generateDatesBetween(startDate: string, endDate: string): string[] {
    const datesArray: string[] = [];
    let currentDate = dayjs(startDate);
    const finalDate = dayjs(endDate);

    while (!currentDate.isAfter(finalDate, "day")) {
      datesArray.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }
    return datesArray;
  }

  function changeDate(date: string) {
    setSelectedDate(date);
  }

  function corrigeData(data: string): { dia: number; mes: number; ano: number } {
    const arrayData = data.split("-");
    return {
      ano: parseInt(arrayData[0], 10),
      mes: parseInt(arrayData[1], 10) - 1,
      dia: parseInt(arrayData[2], 10),
    };
  }

  function formatDateLabel(date: string) {
    const { ano, mes, dia } = corrigeData(date);
    return new Date(ano, mes, dia).toLocaleDateString("pt-BR", {
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
            <button
              key={date}
              type="button"
              className={cn(
                "cursor-pointer rounded-[25px] border-[3px] border-brand-orange px-8 py-3 text-base font-semibold capitalize text-brand-navy transition duration-200 hover:bg-brand-orange hover:text-white max-md:px-6 max-md:py-2.5 max-md:text-sm",
                selectedDate === date && "bg-brand-orange text-white",
              )}
              onClick={() => changeDate(date)}
            >
              {formatDateLabel(date)}
            </button>
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
                    const filteredSessions = sessoesList
                      ?.filter(
                        (sessao) =>
                          dayjs.utc(sessao.startTime).format("YYYY-MM-DD") ===
                          dayjs(selectedDate).format("YYYY-MM-DD"),
                      )
                      ?.filter(
                        (sessao) =>
                          sessao.type === "General" || sessao.roomId === room.id,
                      )
                      ?.toSorted(
                        (a, b) =>
                          new Date(a.startTime).getTime() -
                          new Date(b.startTime).getTime(),
                      );

                    const groupedByTitle = filteredSessions
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
                        {} as Record<string, Sessao[]>,
                      );

                    return (
                      <>
                        {filteredSessions?.map((item, index) => {
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
                                  sess.presentations
                                    ?.toSorted(
                                      (a, b) =>
                                        a.positionWithinBlock -
                                        b.positionWithinBlock,
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

                  {!sessoesList?.some(
                    (sessao) =>
                      dayjs.utc(sessao.startTime).format("YYYY-MM-DD") ===
                        dayjs(selectedDate).format("YYYY-MM-DD") &&
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

        <Modal
          content={<PresentationModal props={modalContent} />}
          reference={openModal}
        />
      </div>
    </div>
  );
}
