"use client";
import { Flex } from "@/components/flex";
import { Icons } from "@/components/ui/icons";
import { UserItem } from "@/components/user-item";
import { useBuilderFIData, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { Card, Typography } from "@mui/joy";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export default function ChatsPage() {
  const { address } = useAccount();
  const { data: builderFiData, isLoading } = useBuilderFIData();
  const { data: allHolding } = useGetHoldings(address);
  const [portfolio, tradingFees] = useMemo(() => {
    if (!allHolding || !builderFiData) return [BigInt(0), BigInt(0)];
    return [
      allHolding.shareRelationships.reduce((prev, curr) => prev + BigInt(curr.owner.buyPrice), BigInt(0)),
      builderFiData.shareParticipants.find(user => user.owner == address?.toLowerCase())?.tradingFeesAmount
    ];
  }, [address, allHolding, builderFiData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full mt-24">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <main className="pt-4 px-2 pb-16">
      <div className="grid gap-4 grid-cols-2 mb-6">
        <Flex component={Card}>
          <Typography level={"body-lg"}>Portfolio Value</Typography>
          <Typography>{formatUnits(portfolio, 18)} ETH</Typography>
        </Flex>
        <Flex component={Card}>
          <Typography level={"body-lg"}>Trading fees</Typography>
          <Typography>{!tradingFees ? "undefined" : formatUnits(BigInt(tradingFees), 18)} ETH</Typography>
        </Flex>
      </div>
      {allHolding?.shareRelationships.map(item => (
        <UserItem
          address={item.owner.owner as `0x${string}`}
          buyPrice={BigInt(item.owner.buyPrice)}
          numberOfHolders={Number(item.owner.numberOfHolders)}
          key={`home-${item.owner}`}
        />
      ))}
    </main>
  );
}
