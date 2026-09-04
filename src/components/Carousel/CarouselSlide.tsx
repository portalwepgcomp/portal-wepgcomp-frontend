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
        "absolute inset-0 transition-opacity duration-[600ms] ease-in-out",
        isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
      )}
      aria-hidden={!isActive}
    >
      <div
        className="flex h-[40vh] min-h-[300px] w-screen flex-col items-center justify-center px-8 pb-16 pt-4 text-white max-xl:pt-24 max-[760px]:h-[35vh] max-[700px]:min-h-[250px] max-[480px]:min-h-[180px] bg-cover bg-bottom"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {children}
      </div>
    </div>
  );
}
