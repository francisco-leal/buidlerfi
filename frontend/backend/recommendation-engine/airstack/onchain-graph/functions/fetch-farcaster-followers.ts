import {gql} from "@apollo/client/core";

import {fetchAllPagesQuery} from "../../index";
import {FarcasterFollowerAddress, RecommendedUser} from "../interfaces/recommended-user";
import formatFarcasterFollowersData from "../utils/format-farcaster-followers";

interface Follower {
    followerAddress: FarcasterFollowerAddress;
}

interface SocialFollowersData {
    SocialFollowers: {
        Follower: Follower[];
    };
}

const socialFollowersQuery = gql`
query MyQuery($user: Identity!) {
  SocialFollowers(
    input: {filter: {identity: {_eq: $user}, dappName: {_eq: farcaster}}, blockchain: ALL, limit: 200}
  ) {
    Follower {
      followerAddress {
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
        mutualFollowing: socialFollowings(
          input: {filter: {identity: {_eq: $user}, dappName: {_eq: farcaster}}}
        ) {
          Following {
            followingAddress {
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

const fetchFarcasterFollowers = async (address: string, existingUsers: RecommendedUser[] = []): Promise<FarcasterFollowerAddress[]> => {
    const farcasterFollowersResponse = await fetchAllPagesQuery<SocialFollowersData>(socialFollowersQuery, {
        user: address,
    })
    return formatFarcasterFollowersData(farcasterFollowersResponse.flatMap(r => r.SocialFollowers.Follower.flatMap(f => f.followerAddress)).filter(Boolean), existingUsers)
};

export default fetchFarcasterFollowers;
