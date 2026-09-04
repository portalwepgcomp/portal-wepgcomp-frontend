"use client";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import Star from "@/components/UI/Star";
import { AuthContext } from "@/context/AuthProvider/authProvider";
import { useEdicao } from "@/hooks/useEdicao";
import { usePresentation } from "@/hooks/usePresentation";
import { Presentation, PresentationBookmark } from "@/models/presentation";

export interface PresentationModalData extends Partial<Presentation> {
  id: string;
  startTime?: string;
  mainAuthor?: { name?: string; email?: string };
}

export default function PresentationModal({ props }: { props: PresentationModalData }) {
  const presentationBookmarkData = { presentationId: props.id };
  const {
    getPresentationBookmark,
    postPresentationBookmark,
    deletePresentationBookmark,
  } = usePresentation();
  const [presentationBookmark, setpresentationBookmark] =
    useState<PresentationBookmark>();

  const { signed } = useContext(AuthContext);
  const router = useRouter();
  const { Edicao } = useEdicao();

  useEffect(() => {
    if (signed) {
      getPresentationBookmark(presentationBookmarkData).then(
        setpresentationBookmark,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signed, props.id]);

  function handleFavorite() {
    if (!signed) {
      router.push("/login");
      return;
    }
    if (presentationBookmark && presentationBookmark.bookmarked) {
      deletePresentationBookmark(presentationBookmarkData);
    } else {
      postPresentationBookmark(presentationBookmarkData);
    }
    setpresentationBookmark({
      bookmarked: !(presentationBookmark && presentationBookmark.bookmarked),
    });
  }

  const handleEvaluateClick = () => {
    window.location.href = `/avaliacao/${props.id}`;
  };

  const presentationDate = props.startTime
    ? dayjs(props.startTime).format("DD/MM")
    : "";
  const presentationTime = props.startTime
    ? dayjs(props.startTime).format("HH:mm")
    : "";

  return (
    <div
      id="presentation-modal-main-wrapper"
      className="z-[1000] flex max-h-[70vh] flex-col items-start gap-4 overflow-y-auto px-10 pb-10 text-black max-[1000px]:gap-3 max-[1000px]:px-6 max-[1000px]:pb-6 max-[500px]:gap-2 max-[500px]:px-2 max-[500px]:pb-4"
    >
      <div className="flex w-full items-center gap-5 border-b border-black pb-5 max-[1000px]:gap-4 max-[1000px]:pb-4 max-[500px]:gap-2 max-[500px]:pb-2">
        <h3 className="w-full text-start text-[2rem] font-semibold leading-8 max-[1000px]:text-2xl max-[1000px]:leading-6 max-[500px]:text-lg max-[500px]:leading-5">
          {props?.submission?.title}
        </h3>
      </div>
      <div className="flex w-full justify-between">
        <div className="flex flex-col items-start gap-2 text-start text-lg font-normal max-[1000px]:text-base max-[500px]:text-sm">
          <div className="flex flex-row items-start gap-4">
            <h5>
              <strong>
                {props?.submission?.mainAuthor?.name ?? props?.mainAuthor?.name}
              </strong>{" "}
              | {props?.submission?.mainAuthor?.email}
            </h5>
          </div>
          <h5 className="text-start font-normal">
            Orientador(a): {props.submission?.advisor?.name}
          </h5>
        </div>
        {!!signed && !!Edicao?.isActive && (
          <div>
            <button
              type="button"
              className="rounded-[1.563rem] border-0 bg-white px-8 py-1 text-lg text-brand-orange transition hover:bg-brand-orange hover:text-white max-[1000px]:text-base max-[500px]:text-sm"
              onClick={handleEvaluateClick}
            >
              Avaliar
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {props.startTime && (
          <h5 className="m-0 rounded-md bg-brand-orange px-4 py-2 text-white max-[500px]:px-2 max-[500px]:py-1 max-[500px]:text-sm">
            {presentationDate} - {presentationTime}
          </h5>
        )}
        {!!signed && !!Edicao?.isActive && (
          <div onClick={handleFavorite} className="cursor-pointer">
            {presentationBookmark && (
              <Star
                color={presentationBookmark.bookmarked ? "#F17F0C" : "#D9D9D9"}
              />
            )}
          </div>
        )}
        <div className="flex items-center">
          <a
            className="rounded-3xl border-0 bg-white px-6 py-1 text-xl font-semibold text-brand-orange no-underline max-[1000px]:px-4 max-[1000px]:text-base max-[500px]:px-2 max-[500px]:text-sm"
            href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${props?.submission?.pdfFile}`}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar apresentação
          </a>
        </div>
      </div>
      <h5 className="text-justify">
        <strong>Abstract: </strong>
        {props.submission?.abstract}
      </h5>
    </div>
  );
}
