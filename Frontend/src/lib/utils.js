import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
//este archivo es necesario para que los componentes de shadcn/ui funcionen
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}