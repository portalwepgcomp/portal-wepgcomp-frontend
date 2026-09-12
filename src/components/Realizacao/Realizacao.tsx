"use client";

import Image from "next/image";

type Logo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
};

const realizacaoLogos: Logo[] = [
  {
    src: "/assets/images/ic_logo_padrao.png",
    alt: "Computação UFBA Logo",
    width: 150,
    height: 150,
    priority: true,
  },
  {
    src: "/assets/images/brasao-ufba.svg",
    alt: "UFBA Logo",
    width: 100,
    height: 130,
    priority: true,
  },
];

const apoioLogos: Logo[] = [
  {
    src: "/assets/images/logo-capes-fundo-claro.jpg",
    alt: "Capes Logo",
    width: 100,
    height: 130,
    priority: true,
  },
  {
    src: "/assets/images/logo-proext.png",
    alt: "Proext Logo",
    width: 100,
    height: 130,
    priority: true,
  },
];

function LogosGrupo({ logos }: { logos: Logo[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 max-md:gap-6">
      {logos.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          priority={logo.priority}
          className="grayscale-[30%] transition duration-300 hover:scale-105 hover:grayscale-0"
          sizes="(max-width: 768px) 100px, 150px"
          style={{ height: "auto" }}
        />
      ))}
    </div>
  );
}

export default function Realizacao() {
  return (
    <div className="flex w-full flex-col items-center gap-8 border-t-2 border-brand-accent bg-[#fafafa] py-12 pb-6 max-md:px-4 max-md:py-8">
      <div className="flex w-[90%] flex-wrap items-start justify-between gap-16 max-md:flex-col max-md:items-center max-md:gap-12">
        <div className="flex flex-col items-center gap-6">
          <h3 className="relative mb-2 text-2xl font-bold uppercase tracking-wide text-brand-navy after:mx-auto after:mt-2 after:block after:h-[3px] after:w-10 after:rounded after:bg-brand-accent max-md:text-[1.3rem]">
            Realização
          </h3>
          <LogosGrupo logos={realizacaoLogos} />
        </div>

        <div className="flex flex-col items-center gap-6">
          <h3 className="relative mb-2 text-2xl font-bold uppercase tracking-wide text-brand-navy after:mx-auto after:mt-2 after:block after:h-[3px] after:w-10 after:rounded after:bg-brand-accent max-md:text-[1.3rem]">
            Apoio
          </h3>
          <LogosGrupo logos={apoioLogos} />
        </div>
      </div>
    </div>
  );
}
