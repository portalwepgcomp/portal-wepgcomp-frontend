"use client";

import Button from "@/components/UI/Button";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useContext, useEffect, useState } from "react";

import Star from "@/components/UI/Star";
import { usePresentation } from "@/hooks/usePresentation";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { PresentationBookmark } from "@/models/presentation";

interface PresentationCardProps {
  key?: string;
  id: string;
  title: string;
  subtitle: string;
  name: string;
  pdfFile: string;
  email: string;
  advisorName: string;
  presentationData?: string;
  cardColor?: string;
  onDelete?: () => void;
}

export default function PresentationCard({
  key,
  id,
  title,
  subtitle,
  name,
  pdfFile,
  email,
  advisorName,
  presentationData,
  cardColor,
  onDelete,
}: Readonly<PresentationCardProps>) {
  const presentationBookmarkData = { presentationId: id };

  const {
    getPresentationBookmark,
    postPresentationBookmark,
    deletePresentationBookmark,
  } = usePresentation();
  const [presentationBookmark, setpresentationBookmark] =
    useState<PresentationBookmark>();

  const { signed } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (signed && id) {
      getPresentationBookmark({ presentationId: id }).then(
        setpresentationBookmark,
      );
    }
  }, [signed, id, getPresentationBookmark]);

  function handleFavorite() {
    if (!signed) {
      router.push("/login");
      return;
    }
    if (presentationBookmark && presentationBookmark.bookmarked) {
      if (onDelete) {
        onDelete();
      } else {
        deletePresentationBookmark(presentationBookmarkData);
      }
    } else {
      postPresentationBookmark(presentationBookmarkData);
    }
    setpresentationBookmark({
      bookmarked: !(presentationBookmark && presentationBookmark.bookmarked),
    });
  }

  const handleEvaluateClick = () => {
    router.push(`/avaliacao/${id}`);
  };

  const presentationDate = presentationData
    ? dayjs(presentationData).format("DD/MM")
    : "";
  const presentationTime = presentationData
    ? dayjs(presentationData).format("HH:mm")
    : "";

  return (
    <div
      className="flex flex-col items-start gap-2.5 rounded-[10px] p-6 text-black max-[550px]:items-center max-[550px]:p-4"
      style={{ backgroundColor: cardColor ?? undefined }}
      key={key}
    >
      <div className="flex w-full items-center gap-[15px] border-b border-black pb-[15px]">
        <h3 className="text-start text-lg font-semibold leading-[27px]">
          {title}
        </h3>
      </div>

      <div className="flex w-full justify-between max-[550px]:flex-col max-[550px]:items-center">
        <div className="flex flex-col items-start gap-1.5 text-start text-[15px] font-normal max-[550px]:items-center max-[550px]:text-center">
          <div className="flex flex-row items-start gap-2.5 max-[550px]:flex-col max-[550px]:items-center">
            <strong>{name}</strong>
            <div className="max-[550px]:hidden">|</div>
            <div>{email}</div>
          </div>
          <h4 className="text-start text-[15px] font-normal max-[550px]:text-center">
            Orientador(a): {advisorName}
          </h4>
        </div>
        {!!signed && (
          <div>
            <Button size="lg"
              type="button"
              variante="primary"
              onClick={handleEvaluateClick}
            >
              Avaliar
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 max-[550px]:flex-col max-[550px]:items-center">
        {presentationData && (
          <em className="m-0 rounded-[5px] bg-brand-accent px-2.5 py-1 text-[15px] not-italic text-white">
            {presentationDate} - {presentationTime}
          </em>
        )}
        {!!signed && (
          <div onClick={handleFavorite} className="cursor-pointer">
            {presentationBookmark && (
              <Star
                color={
                  presentationBookmark.bookmarked ? "#F17F0C" : "#D9D9D9"
                }
              />
            )}
          </div>
        )}
        <div className="flex items-center">
          <a
            className="rounded-[20px] bg-white px-5 py-0.5 font-semibold text-brand-orange no-underline"
            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${pdfFile}`}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar apresentação
          </a>
        </div>
      </div>

      <div className="text-justify">
        <strong>Abstract: </strong>
        {subtitle}
      </div>
    </div>
  );
}
