import { fetchQuery, init } from "@airstack/node";

if (!process.env.AIRSTACK_TOKEN) throw new Error("AIRSTACK_TOKEN is not set in environment variables");

init(process.env.AIRSTACK_TOKEN);

const getWalletSocialsQuery = `query GetWallet($identity: Identity!) {
  Wallet(input: {identity: $identity, blockchain: ethereum}) {
    primaryDomain {
      name
    }
    domains {
      name
    }
    socials {
      dappName
      profileName
      profileImage
    }
    xmtp {
      isXMTPEnabled
    }
  }
}
`;

export interface GetWalletSocialsResponse {
  primaryDomain?: {
    name: string;
  };
  domains?: {
    name: string;
  }[];
  socials?: {
    dappName: string;
    profileName: string;
    profileImage: string;
  }[];
  xmtp?: {
    isXMTPEnabled: boolean;
  };
}

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const res = await fetchQuery(getWalletSocialsQuery, { identity: searchParams.get("address") });
  return Response.json(res.data.Wallet);
};
