"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CarouselSlideProps {
  imageUrl: string;
  isActive: boolean;
  children: ReactNode;
}

export default function CarouselSlide({
  imageUrl,
  isActive,
  children,
}: Readonly<CarouselSlideProps>) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-in-out",
        isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
      )}
      aria-hidden={!isActive}
    >
      <div
        className="relative flex min-h-[460px] md:min-h-[500px] w-full flex-col items-center justify-center bg-cover bg-center px-4 py-12 pb-20 text-white"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-3 text-center">
          {children}
        </div>
      </div>
    </div>
  );
}
