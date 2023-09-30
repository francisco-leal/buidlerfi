import { useQuery } from '@airstack/airstack-react';

const getSocialFollowersQuery = `query GetSocial($identity: Identity!) {
  SocialFollowers(input: {filter: {identity: {_eq: $identity}}, blockchain: ALL}) {
    Follower {
      dappName
      dappSlug
      followerAddress {
        identity
        domains {
          isPrimary
          name
        }
      }
    }
  }
}
`;

interface GetSocialFollowersResponse {
	data?: {
		SocialFollowers: {
			Follower: {
				dappName: string;
				dappSlug: string;
				followerAddress: {
					identity: string;
					domains: {
						isPrimary: boolean;
						name: string;
					}[];
				};
			}[];
		};
	};
}

export const useGetSocialFollowers = (address?: `0x${string}`) => {
	const queryRes: {
		data?: GetSocialFollowersResponse;
		error: unknown;
		loading: boolean;
	} = useQuery(getSocialFollowersQuery, { identity: address });

	return queryRes;
};

const getWalletDetailsQuery = `query GetWallet($identity: Identity!) {
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
    }
    xmtp {
      isXMTPEnabled
    }
  }
}
`;

interface GetWalletDetailsResponse {
	data?: {
		Wallet: {
			primaryDomain?: {
				name: string;
			};
			domains?: {
				name: string;
			}[];
			socials?: {
				dappName: string;
				profileName: string;
			}[];
			xmtp?: {
				isXMTPEnabled: boolean;
			};
		};
	};
}

export const useGetWalletDetails = (address?: `0x${string}`) => {
	const queryRes: {
		data?: GetWalletDetailsResponse;
		error: unknown;
		loading: boolean;
	} = useQuery(getWalletDetailsQuery, { identity: address });
	return queryRes;
};
