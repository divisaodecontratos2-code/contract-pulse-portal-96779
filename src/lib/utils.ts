import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte uma string para Title Case (Primeira Letra Maiúscula, o resto minúsculo)
 * e remove espaços extras.
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}