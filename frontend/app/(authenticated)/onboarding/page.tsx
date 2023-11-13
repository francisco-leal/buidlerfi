"use client";

import { Flex } from "@/components/shared/flex";
import { Button, Divider, FormControl, Input, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import * as React from "react";

export default function Onboarding() {
  const { linkWallet } = usePrivy();
  const [profileInformation, setProfileInformation] = React.useState<string>("");

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
      <Button onClick={linkWallet}>Connect Wallet</Button>
      <Divider />
      <Flex y gap1>
        <Typography textAlign="start" level="title-md">
          Don't have a wallet? No problem.
        </Typography>
        <Typography level="body-sm" mt={1}>
          Edit your basic profile information for builder.fi
        </Typography>
        <FormControl sx={{ width: "100%" }}>
          <Input
            value={profileInformation}
            onChange={e => setProfileInformation(e.target.value)}
            placeholder="Enter display name"
          />
        </FormControl>
      </Flex>
      <Button onClick={linkWallet}>Save</Button>
    </Flex>
  );
}
