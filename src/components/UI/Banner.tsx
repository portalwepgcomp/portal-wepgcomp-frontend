"use client";

interface BannerProps {
  title: string;
}

export default function Banner({ title }: Readonly<BannerProps>) {
  return (
    <div className="mb-6 flex h-[85px] sm:h-[95px] w-full items-center justify-center rounded-none bg-[url('/assets/images/slide1.png')] bg-cover bg-center shadow-sm">
      <h1 className="m-0 text-center text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {title}
      </h1>
    </div>
  );
}
