import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortAddress = (address: `0x${string}`) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEth = (eth?: bigint) => {
  return `${formatUnits(eth || BigInt(0), 18)}`;
};

export const encodeQueryData = (data: Record<string, string>) => {
  const ret = [];
  for (const d in data) {
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  }
  return ret.join("&");
};
