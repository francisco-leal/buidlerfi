"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { formatToDisplayString } from "@/lib/utils";
import { ChevronRight } from "@mui/icons-material";
import { Skeleton, Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { Flex } from "./flex";

interface Props {
  address: `0x${string}`;
  numberOfHolders?: number;
  buyPrice?: bigint;
}

export function UserItem({ address, numberOfHolders, buyPrice }: Props) {
  const router = useRouter();

  const socialData = useSocialData(address);

  return (
    <Flex
      x
      xsb
      yc
      py={1}
      px={2}
      sx={{ cursor: "pointer", ":hover": { backgroundColor: "neutral.100" } }}
      onClick={() => router.push(`/profile/${address}`)}
    >
      <Flex x yc gap2>
        <Avatar size="sm" src={socialData.avatar}>
          <Skeleton loading={socialData.isLoading} />
        </Avatar>
        <Flex y gap={0.5}>
          <Typography textColor={"neutral.800"} fontWeight={600} level="body-sm">
            <Skeleton loading={socialData.isLoading}>{socialData.name}</Skeleton>
          </Typography>
          {numberOfHolders !== undefined && buyPrice !== undefined && (
            <Typography textColor={"neutral.600"} level="body-sm">
              {numberOfHolders.toString()} holders • Price {formatToDisplayString(buyPrice, 18)} ETH
            </Typography>
          )}
        </Flex>
      </Flex>
      <ChevronRight />
    </Flex>
  );
}
