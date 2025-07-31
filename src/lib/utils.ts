import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "-";
    return format(dateObj, "dd.MM.yyyy", { locale: de });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-";
  return value.toLocaleString('de-DE');
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  
  // Die Werte sind bereits in Euro gespeichert
  // z.B. 8110000 = 8.110.000,00 €
  return `${value.toLocaleString('de-DE')},00 €`;
}
