import {gql} from "@apollo/client/core";

import {fetchAllPagesQuery} from "../../index";
import {LensFollowingAddress, RecommendedUser} from "../interfaces/recommended-user";
import formatLensFollowingsData from "../utils/format-lens-followings";

interface Following {
    followingAddress: LensFollowingAddress;
}

interface SocialFollowingsData {
    SocialFollowings: {
        Following: Following[];
    };
}

const socialFollowingsQuery = gql`
query MyQuery($user: Identity!) {
    SocialFollowings(
      input: {filter: {identity: {_eq: $user}, dappName: {_eq: lens}}, blockchain: ALL, limit: 200}
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
            input: {filter: {identity: {_eq: $user}, dappName: {_eq: lens}}}
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

const fetchLensFollowings = async (address: string, existingUsers: RecommendedUser[] = []): Promise<LensFollowingAddress[]> => {

    const lensFollowingsResponse = await fetchAllPagesQuery<SocialFollowingsData>(socialFollowingsQuery, {
        user: address,
    })
    return formatLensFollowingsData(lensFollowingsResponse.flatMap(r => r.SocialFollowings?.Following?.flatMap(f => f.followingAddress)).filter(Boolean), existingUsers)
};

export default fetchLensFollowings;
