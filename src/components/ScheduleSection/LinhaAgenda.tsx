import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { Presentation } from "@/models/presentation";
import { PresentationBlock } from "@/models/session";

interface LinhaAgendaProps {
  presentation: Presentation | PresentationBlock;
  type?: string;
  showTime?: boolean;
}

/**
 * Linha compacta da agenda (horário + título + autor + seta), clicável para
 * abrir a apresentação. Usada apenas pelo `ScheduleSection`. Antes se chamava
 * `PresentationCard` (colidia com o card de detalhe de `CardApresentacao/`).
 */
export default function LinhaAgenda({
  presentation,
  showTime = true,
  type,
}: Readonly<LinhaAgendaProps>) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const isGeneral = type === "GeneralSession";

  const handleClick = () => {
    if (isGeneral) return;
    router.push(`/apresentacoes/${presentation.id}`);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const submission = (presentation as Presentation).submission;
  const sessao = presentation as PresentationBlock;

  return (
    <div
      className={cn(
        "mb-3 w-full rounded-lg p-4 transition-all duration-200",
        type !== "PresentationSession" && "border border-[#8aabd1]",
        isGeneral ? "cursor-default bg-transparent" : "cursor-pointer",
        !isGeneral &&
          (isHovered ? "bg-[#89cff0]" : "bg-[#cdeefd] hover:translate-x-1"),
        !isGeneral && isHovered && "border-brand-blue",
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        {showTime && (
          <div className="min-w-[50px] text-center text-sm font-semibold text-brand-blue max-md:min-w-[45px] max-md:text-xs">
            {presentation?.startTime
              ? formatTime(presentation.startTime)
              : "??:??"}
          </div>
        )}
        <div className="flex-1">
          <p className="mb-1 text-lg font-semibold text-[#1a1a1a] max-md:text-sm">
            {submission?.title ?? sessao.title}
          </p>
          <h4 className="m-0 text-base leading-snug text-[#4a4a4a] max-md:text-base">
            {submission?.mainAuthor?.name}
          </h4>
        </div>
        {!isGeneral && (
          <div
            className={cn(
              "text-xl font-bold text-brand-blue opacity-50 transition-opacity duration-200",
              isHovered && "opacity-100",
            )}
          >
            →
          </div>
        )}
      </div>
    </div>
  );
}
