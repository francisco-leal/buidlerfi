"use client";

import { refreshAllUsersProfileSA } from "@/backend/user/userServerActions";
import { Flex } from "@/components/shared/flex";
import { Button } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";

export default function AdminPage() {
  const { getAccessToken } = usePrivy();
  return (
    <Flex y grow p={2}>
      <Button onClick={async () => refreshAllUsersProfileSA({ authorization: await getAccessToken() })}>
        Refresh social profile of all users
      </Button>
    </Flex>
  );
}
