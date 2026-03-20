import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getAddress, isAddress } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidEthereumAddress(value: string): boolean {
  return isAddress(value, { strict: false })
}

export function toChecksumAddress(value: string): string | null {
  if (!isValidEthereumAddress(value)) {
    return null
  }

  try {
    return getAddress(value)
  } catch {
    return null
  }
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(value)
}
