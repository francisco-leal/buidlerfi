import { fetchQuery, init } from '@airstack/node';

if (!process.env.AIRSTACK_TOKEN) throw new Error('AIRSTACK_TOKEN is not set in environment variables');

init(process.env.AIRSTACK_TOKEN);

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

export interface GetFollowersResponse {
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
}

export const GET = async (req: Request) => {
	const { searchParams } = new URL(req.url);
	const res = await fetchQuery(getSocialFollowersQuery, { identity: searchParams.get('address') });
	console.log(res);
	return Response.json(res.data.SocialFollowers);
};
