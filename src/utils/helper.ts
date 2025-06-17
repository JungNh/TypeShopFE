const CURRENCRY_FORMATTER = new Intl.NumberFormat(undefined, {
  // currency: "USD",
  currency: "VND",
  style: "currency",
});

export const formatCurrencry = (number: any) => {
  return CURRENCRY_FORMATTER.format(number);
};

export const getDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en");
};

export const formatTimer = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
};

export const baseUrl = import.meta.env.VITE_API_URL;

export function getLabelOption(options: Array<any>, value: string | boolean | number | undefined) {
  return options?.find((v) => v?.value === value)?.label || value;
}