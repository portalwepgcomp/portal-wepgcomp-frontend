import Button from "@/components/UI/Button";
import React, { useState } from "react";

interface ReadMoreProps {
  text: string;
  maxLength?: number;
}

function ReadMoreComponent({ text, maxLength = 100 }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return (
      <span className="flex w-full flex-col items-start text-justify text-base leading-relaxed text-[#333]">
        {text}
      </span>
    );
  }

  return (
    <span className="flex w-full flex-col items-start text-justify text-base leading-relaxed text-[#333] max-md:w-full">
      {expanded ? text : text.slice(0, maxLength) + "..."}
      <Button size="lg"
        variante="secondary" className="mt-1"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        {expanded ? "Ler menos" : "Ler mais"}
      </Button>
    </span>
  );
}

export default React.memo(ReadMoreComponent);
