"use client";
import { Flex } from "@/components/shared/flex";
import { Button, Typography } from "@mui/joy";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useMemo } from "react";

export default function ConnectWallet({ onWalletAdded }: { onWalletAdded: (wallet: string) => void }) {
  const { connectWallet } = usePrivy();
  const { wallets } = useWallets();

  const externalWallet = useMemo(() => {
    // we only care about the most recent connected wallet that isn't embedded
    return wallets.find(i => i.connectorType != "embedded")?.address;
  }, [wallets]);

  useEffect(() => {
    if (externalWallet) {
      onWalletAdded(externalWallet);
    }
  }, [externalWallet]);

  return (
    <Flex grow y gap3 px={4}>
      <Flex y gap1 mt={4}>
        <Typography textAlign="start" level="title-md">
          builder.fi is better with friends.
        </Typography>
        <Typography level="body-sm" mt={1}>
          Connect your wallet to display your Lens, Farcaster or Talent Protocol profile and get personalized
          recommendations.
        </Typography>
      </Flex>
      <Button onClick={connectWallet}>Connect Wallet</Button>
    </Flex>
  );
}
