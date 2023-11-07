import {
  createUserSA,
  getCurrentUserSA,
  getUserSA,
  refreshCurrentUserProfileSA
} from "@/backend/user/userServerActions";
import { Prisma } from "@prisma/client";
import { User as PrivyUser, usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";

export type GetCurrentUserResponse = Prisma.UserGetPayload<{
  include: { inviteCodes: true; points: true; socialProfiles: true };
}>;

export type GetUserResponse = Prisma.UserGetPayload<{ include: { socialProfiles: true } }>;

export const useCreateUser = () => {
  const { getAccessToken } = usePrivy();
  return useMutation(async ({ privyUser, inviteCode }: { privyUser: PrivyUser; inviteCode: string }) => {
    return createUserSA(privyUser, inviteCode, { authorization: await getAccessToken() }).then(res => res.data);
  });
};

export const useGetUser = (address?: string) => {
  const { getAccessToken } = usePrivy();
  return useQuery(
    ["useGetUser", address],
    async () => getUserSA(address!, { authorization: await getAccessToken() }).then(res => res.data),
    { enabled: !!address }
  );
};

export const useGetCurrentUser = () => {
  const { getAccessToken } = usePrivy();
  return useQuery(["useGetCurrentUser"], async () =>
    getCurrentUserSA({ authorization: await getAccessToken() }).then(res => res.data)
  );
};

export const useRefreshCurrentUser = () => {
  const { getAccessToken } = usePrivy();
  return useMutation(async () =>
    refreshCurrentUserProfileSA({ authorization: await getAccessToken() }).then(res => res.data)
  );
};
