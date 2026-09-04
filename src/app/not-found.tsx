"use client";

import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mt-[90px] mb-[300px] flex flex-col items-center justify-center gap-5 text-center text-[50px] text-[#0066BA]">
        <Image
          src="/assets/images/emoji_frown.svg"
          alt="Emoji Triste"
          width={60}
          height={60}
        />
        Ops! Essa página não existe
      </h1>
    </div>
  );
}
