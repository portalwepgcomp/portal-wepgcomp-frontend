export interface OptionItem {
  label: string;
  value: string;
}

export const formatOptions = <T extends object>(
  options: T[],
  labelField: keyof T | string,
): OptionItem[] => {
  return (options || []).map((v) => ({
    label: String((v as Record<string, unknown>)[labelField as string] ?? ""),
    value: String((v as Record<string, unknown>).id ?? ""),
  }));
};
