import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

export interface GetEnsResponse {
  name?: string;
  avatar?: string;
}

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const ensName = await client.getEnsName({ address: searchParams.get("address") as `0x${string}` });
  let avatar: string | undefined = undefined;
  if (ensName) {
    avatar = (await client.getEnsAvatar({ name: ensName as string })) as string;
  }
  return Response.json({ data: { name: ensName, avatar } });
};
