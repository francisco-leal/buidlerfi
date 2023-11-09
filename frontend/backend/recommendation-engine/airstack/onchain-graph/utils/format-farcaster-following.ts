import { FarcasterFollowingAddress, FollowFarcaster, RecommendedUser } from '../interfaces/recommended-user';

// Function to format Farcaster followings data
function formatFarcasterFollowingsData(
  followings: FarcasterFollowingAddress[],
  existingUsers: RecommendedUser[] = []
): FarcasterFollowingAddress[] {
  if (!followings || followings?.length === 0) {
    return [...existingUsers];
  }

  // Initialize an array to store the recommended users
  const recommendedUsers: FarcasterFollowingAddress[] = [...existingUsers];

  // Iterate over each following
  for (let i = 0; i < followings.length; i++) {
    const following = followings[i];
    // Find the index of the following in the recommended users list
    const existingUserIndex = recommendedUsers.findIndex(({ addresses: recommendedUserAddresses }) =>
      recommendedUserAddresses?.some((address) => following.addresses?.includes(address))
    );

    // Check if the following follows back
    const followsBack = Boolean(following?.mutualFollowing?.Following?.[0]);

    // If the following is already in the recommended users list
    if (existingUserIndex !== -1) {
      // Get the existing follows object or an empty object if it doesn't exist
      const follows: FollowFarcaster = recommendedUsers[existingUserIndex]?.follows ?? {
        followedOnFarcaster: false,
        followingOnFarcaster: false,
      };

      // Update the existing user with the new following data
      recommendedUsers[existingUserIndex] = {
        ...following,
        ...recommendedUsers[existingUserIndex],
        follows: {
          ...(follows || {}),
          followingOnFarcaster: true,
          followedOnFarcaster: followsBack,
        },
      };
      console.log(recommendedUsers[existingUserIndex].follows);
    } else {
      // If the following is not in the recommended users list, add it
      recommendedUsers.push({
        ...following,
        follows: {
          followingOnFarcaster: true,
          followedOnFarcaster: followsBack,
        },
      });
    }
  }

  // Return the list of recommended users
  return recommendedUsers;
}

export default formatFarcasterFollowingsData;
