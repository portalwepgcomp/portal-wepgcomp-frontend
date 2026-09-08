import { Info } from "lucide-react";

const InfoBox = ({ title, message }: { title: string; message: string }) => {
  return (
    <div className="flex items-start rounded-lg border border-[#b8daff] bg-[#e7f3ff] p-4 text-[#004085]">
      <Info className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-[#0066cc]" />
      <div>
        <p className="mb-1 font-bold">{title}</p>
        <p className="m-0">{message}</p>
      </div>
    </div>
  );
};

export default InfoBox;
