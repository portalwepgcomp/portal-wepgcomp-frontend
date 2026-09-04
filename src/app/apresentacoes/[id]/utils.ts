import dayjs from "dayjs";

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export const formatDate = (dateString: string) => {
  return dayjs(dateString).format("DD/MM/YYYY");
};

export const formatOnlyTime = (dateString: string) => {
  return dayjs(dateString).format("HH:mm");
};