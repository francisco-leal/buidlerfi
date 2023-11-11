import { ServerActionOptions, ServerActionResponse } from "@/lib/serverActionWrapper";
import { usePrivy } from "@privy-io/react-auth";
import { QueryKey, useQuery } from "@tanstack/react-query";

export const useQuerySA = <TResponse, TQueryKey extends QueryKey = QueryKey>(
  key: TQueryKey,
  queryFn: (options: ServerActionOptions) => Promise<ServerActionResponse<TResponse>>,
  options?: { enabled?: boolean }
) => {
  const { getAccessToken } = usePrivy();
  return useQuery(
    key,
    async () => {
      const token = await getAccessToken();
      const res = await queryFn({ authorization: token });
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    options
  );
};
