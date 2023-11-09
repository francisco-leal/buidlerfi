import {FollowLens, LensFollowingAddress, RecommendedUser} from "../interfaces/recommended-user";

function formatLensFollowingsData(followings: LensFollowingAddress[], existingUsers: RecommendedUser[] = []): LensFollowingAddress[] {
    if (!followings || followings?.length === 0) {
        return [...existingUsers]
    }

    // Initialize an array to store the recommended users
    const recommendedUsers: LensFollowingAddress[] = [...existingUsers];

    // Iterate over each following
    for (let i = 0; i < followings.length; i++){
        const following = followings[i];
        // Check if the current following is already in the recommended users list
        const existingUserIndex = recommendedUsers.findIndex(
            ({ addresses: recommendedUserAddresses }) =>
                recommendedUserAddresses?.some(address => following.addresses?.includes(address))
        );

        // Check if the current following follows back
        const followsBack = Boolean(following?.mutualFollowing?.Following?.[0]);

        // If the following is already in the recommended users list
        if (existingUserIndex !== -1) {
            // Get the existing follows object or an empty object if it doesn't exist
            const follows: FollowLens = recommendedUsers[existingUserIndex]?.follows ?? {followingOnLens: false, followedOnLens: false};

            // Update the existing user with the new following data
            recommendedUsers[existingUserIndex] = {
                ...following,
                ...recommendedUsers[existingUserIndex],
                follows: {
                    ...(follows || {}),
                    followingOnLens: true,
                    followedOnLens: followsBack
                }
            };
        } else {
            // If the following is not in the recommended users list, add it
            recommendedUsers.push({
                ...following,
                follows: {
                    followingOnLens: true,
                    followedOnLens: followsBack
                }
            });
        }
    }

    // Return the list of recommended users
    return recommendedUsers;
}

export default formatLensFollowingsData;