import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const USD_TO_INR = 83;

/** Format a USD price as "₹Y" (INR only) */
export function formatPrice(usd) {
  const inr = usd * USD_TO_INR;
  return `₹${inr.toFixed(0)}`;
}

/** Short format for tight spaces — "$X.XX" */
export function formatUSD(usd) {
  return `$${usd.toFixed(2)}`;
}

/** Short format for INR — "₹Y" */
export function formatINR(usd) {
  return `₹${(usd * USD_TO_INR).toFixed(0)}`;
}