import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

export const formatDate = (dateStart: string): string => {
	const d_Start = dayjs(dateStart);

	const formattedDate = d_Start.format("DD/MM/YYYY");
	const startTime = d_Start.format("HH:mm");

	return `${formattedDate} - Início: ${startTime}h`;
};

export const getDurationInMinutes = (dateStart: string, dateEnd: string) => {
	const d_inicio = dayjs(dateStart);
	const d_final = dayjs(dateEnd);

	return d_final.diff(d_inicio, "minute");
};

export const formatDateEvent = (
	dateStart: string | undefined,
	dateEnd: string | undefined
): string => {
	const dateOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	if (!dateStart || !dateEnd) return "Carregando...";

  const startMonth = new Date(dateStart).getMonth();
  const endMonth = new Date(dateEnd).getMonth();

  const start = new Date(dateStart).toLocaleDateString("pt-BR", {
    ...dateOptions,
    year: undefined,
    month: startMonth !== endMonth ? "long" : undefined,
  });
	const end = new Date(dateEnd).toLocaleDateString("pt-BR", dateOptions);

	return `${start} a ${end}`;
};

export const formatDateUniq = (date: string | undefined): string => {
	const dateOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	if (!date) return "Carregando...";
	return new Date(date).toLocaleDateString("pt-BR", dateOptions);
};
