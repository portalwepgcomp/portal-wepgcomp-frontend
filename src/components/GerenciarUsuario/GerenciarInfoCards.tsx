interface InfoCardProps {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
  corFundo: string;
}

function InfoCard({ icone, titulo, descricao, corFundo }: InfoCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e9ecef] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <div
        className={`flex h-[50px] w-[50px] items-center justify-center rounded-lg ${corFundo}`}
      >
        {icone}
      </div>
      <div className="flex-1">
        <div className="mb-1 text-base font-semibold text-[#212529]">
          {titulo}
        </div>
        <div className="text-sm leading-snug text-[#6c757d]">{descricao}</div>
      </div>
    </div>
  );
}

export default function GerenciarInfoCards() {
  return (
    <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 max-md:grid-cols-1">
      <InfoCard
        corFundo="bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] text-[#e65100]"
        titulo="Professor Pendente"
        descricao="Professor aguardando aprovação administrativa"
        icone={
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
          </svg>
        }
      />
      <InfoCard
        corFundo="bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] text-[#1565c0]"
        titulo="Administrador"
        descricao="Pode aprovar professores e gerenciar usuários"
        icone={
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,12.4 14.4,13.2 13.7,13.7V16.3C13.7,16.8 13.3,17.2 12.8,17.2H11.3C10.8,17.2 10.4,16.8 10.4,16.3V13.8C9.68,13.3 9.3,12.5 9.3,11.6V10C9.2,8.6 10.6,7 12,7Z" />
          </svg>
        }
      />
      <InfoCard
        corFundo="bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] text-[#e65100]"
        titulo="Superadministrador"
        descricao="Acesso completo ao sistema"
        icone={
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
          </svg>
        }
      />
    </div>
  );
}
