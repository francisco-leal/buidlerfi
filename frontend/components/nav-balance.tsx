"use client";
import { Typography } from "@mui/joy";
import { useAccount, useBalance } from "wagmi";

export function NavBalance() {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address
  });

  if (balance) {
    return (
      <Typography>
        {parseFloat(balance?.formatted).toFixed(3)} {balance?.symbol}
      </Typography>
    );
  } else {
    return <></>;
  }
}
