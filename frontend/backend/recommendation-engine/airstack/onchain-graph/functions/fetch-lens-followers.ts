import {gql} from "@apollo/client/core";

import {fetchAllPagesQuery} from "../../index";
import {LensFollowerAddress, RecommendedUser} from "../interfaces/recommended-user";
import formatLensFollowersData from "../utils/format-lens-followers";

interface Follower {
    followerAddress: LensFollowerAddress;
}

interface SocialFollowersData {
    SocialFollowers: {
        Follower: Follower[];
    };
}

const socialFollowersQuery = gql`
query MyQuery($user: Identity!) {
  SocialFollowers(
    input: {filter: {identity: {_eq: $user}, dappName: {_eq: lens}}, blockchain: ALL, limit: 200}
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
          input: {filter: {identity: {_eq: $user}, dappName: {_eq: lens}}}
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

const fetchLensFollowers = async (address: string, existingUsers: RecommendedUser[] = []): Promise<LensFollowerAddress[]> => {

    const lensFollowersResponse = await fetchAllPagesQuery<SocialFollowersData>(socialFollowersQuery, {
        user: address,
    })

    return formatLensFollowersData(lensFollowersResponse.flatMap(r => r.SocialFollowers?.Follower?.flatMap(f => f.followerAddress)).filter(Boolean), existingUsers)
};

export default fetchLensFollowers;
