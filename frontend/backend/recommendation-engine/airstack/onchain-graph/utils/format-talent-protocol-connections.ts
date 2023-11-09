import { talentProtocolConnectionTypeToFollowObject } from "../../../talent-protocol";
import { FollowTalentProtocol, RecommendedUser, TalentProtocolRecommendedUser } from "../interfaces/recommended-user";

// This function formats the data of Talent Protocol connections
export function formatTalentProtocolConnectionsData(
  talentProtocolConnections: TalentProtocolRecommendedUser[],
  existingUsers: RecommendedUser[] = []
): TalentProtocolRecommendedUser[] {
  if (!talentProtocolConnections || talentProtocolConnections?.length === 0) {
    return [...existingUsers];
  }

  // Initialize an array to store the recommended users
  const recommendedUsers: TalentProtocolRecommendedUser[] = [...existingUsers];

  // Loop through each follower
  for (let i = 0; i < talentProtocolConnections.length; i++) {
    const talentProtocolConnection = talentProtocolConnections[i];

    // Find the index of the follower in the recommendedUsers array
    const existingUserIndex = recommendedUsers.findIndex(({ addresses: recommendedUsersAddresses }) =>
      // Check if the follower's address is in the recommended user's addresses
      recommendedUsersAddresses?.some?.((address) => talentProtocolConnection.addresses?.includes?.(address))
    );

    // If the talent protocol connection is already in the recommendedUsers array
    if (existingUserIndex !== -1) {
      // Get the follow object of the existing user
      const follows: FollowTalentProtocol = recommendedUsers?.[existingUserIndex]?.follows ?? {
        followingOnTalentProtocol: false,
        followedOnTalentProtocol: false
      };

      // Update the existing user in the recommendedUsers array
      recommendedUsers[existingUserIndex] = {
        ...talentProtocolConnection,
        ...recommendedUsers[existingUserIndex],
        follows: {
          ...follows,
          ...talentProtocolConnectionTypeToFollowObject(talentProtocolConnection.connectionType!)
        }
      };
    } else {
      // If the follower is not in the recommendedUsers array, add them
      recommendedUsers.push({
        ...talentProtocolConnection,
        follows: talentProtocolConnectionTypeToFollowObject(talentProtocolConnection.connectionType!)
      });
    }
  }

  // Return the array of recommended users
  return recommendedUsers;
}

export default formatTalentProtocolConnectionsData;
