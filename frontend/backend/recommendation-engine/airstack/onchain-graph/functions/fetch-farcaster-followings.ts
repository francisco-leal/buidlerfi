import {gql} from "@apollo/client/core";

import {fetchAllPagesQuery} from "../../index";
import {FarcasterFollowingAddress, RecommendedUser} from "../interfaces/recommended-user";
import formatFarcasterFollowingsData from "../utils/format-farcaster-following";

interface Following {
    followingAddress: FarcasterFollowingAddress;
}

interface SocialFollowingsData {
    SocialFollowings: {
        Following: Following[];
    };
}

const socialFollowingsQuery = gql`
query MyQuery($user: Identity!) {
  SocialFollowings(
    input: {filter: {identity: {_eq: $user}, dappName: {_eq: farcaster}}, blockchain: ALL, limit: 200}
  ) {
    Following {
      followingAddress {
        addresses
        domains {
          name
          isPrimary
        }
        socials {
          dappName
          blockchain
          profileName
          profileImage
          profileTokenId
          profileTokenAddress
        }
        xmtp {
          isXMTPEnabled
        }
        mutualFollower: socialFollowers(
          input: {filter: {identity: {_eq: $user}, dappName: {_eq: farcaster}}}
        ) {
          Follower {
            followerAddress {
              socials {
                profileName
              }
            }
          }
        }
      }
    }
  }
}
`;

const fetchFarcasterFollowings = async (address: string, existingUsers: RecommendedUser[] = []): Promise<FarcasterFollowingAddress[]> => {
    const farcasterFollowingsResponse = await fetchAllPagesQuery<SocialFollowingsData>(socialFollowingsQuery, {
        user: address,
    })
    return formatFarcasterFollowingsData(farcasterFollowingsResponse.flatMap(r => r.SocialFollowings?.Following?.flatMap(f => f.followingAddress)).filter(Boolean), existingUsers)
};

export default fetchFarcasterFollowings;
