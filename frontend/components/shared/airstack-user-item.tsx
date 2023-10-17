"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Flex } from "./flex";

interface Props {
  address: `0x${string}`;
  dappName: string;
}

export function AirstackUserItem({ address, dappName }: Props) {
  const router = useRouter();

  const socialData = useSocialData(address);

  return (
    <Flex
      x
      xsb
      yc
      px={{ xs: 0, sm: 2 }}
      py={1}
      sx={{ ":hover": { backgroundColor: "neutral.100" } }}
      className="transition-all cursor-pointer"
      onClick={() => router.push(`/${address}`)}
    >
      <Flex x yc gap2>
        <Avatar size="sm" src={socialData.avatar} />
        <Flex y gap={0.5}>
          <Typography fontWeight={700} level="body-sm">
            {socialData.name}
          </Typography>
          <Typography textColor={"neutral.500"} level="body-sm">
            {dappName}
          </Typography>
        </Flex>
      </Flex>
      <ChevronRight className="h-4 w-4" />
    </Flex>
  );
}
