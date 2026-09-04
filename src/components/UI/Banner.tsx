"use client";

interface BannerProps {
  title: string;
}

export default function Banner({ title }: Readonly<BannerProps>) {
  return (
    <div className="mb-10 flex h-[120px] w-full items-center justify-center rounded-[8px] bg-[url('/assets/images/slide1.png')] bg-cover bg-center">
      <h1 className="m-0 text-center text-4xl font-bold text-white">
        {title}
      </h1>
    </div>
  );
}
