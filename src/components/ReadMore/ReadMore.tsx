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
      <button
        className="mt-1 cursor-pointer rounded border-0 bg-brand-accent px-2.5 py-0.5 text-base text-white transition hover:opacity-90 focus:outline-none"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        {expanded ? "Ler menos" : "Ler mais"}
      </button>
    </span>
  );
}

export default React.memo(ReadMoreComponent);
