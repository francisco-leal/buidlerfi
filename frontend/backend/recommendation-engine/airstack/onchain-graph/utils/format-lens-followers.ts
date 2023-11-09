import {FollowLens, LensFollowerAddress, RecommendedUser} from "../interfaces/recommended-user";

// Function to format lens followers data
function formatLensFollowersData(followers: LensFollowerAddress[], existingUsers: RecommendedUser[] = []): LensFollowerAddress[] {
    if (!followers || followers?.length === 0) {
        return [...existingUsers]
    }

    // Initialize an array to store the recommended users
    const recommendedUsers: LensFollowerAddress[] = [...existingUsers];

    // Iterate over each follower
    for (let i = 0; i < followers.length; i++){
        const follower = followers[i];
        // Find the index of the follower in the recommended users list
        const existingUserIndex = recommendedUsers.findIndex(
            ({ addresses: recommendedUserAddresses }) =>
                recommendedUserAddresses?.some(address => follower.addresses?.includes(address))
        );

        // Check if the follower is also following
        const isFollowing = Boolean(follower?.mutualFollowing?.Following?.length);

        // If the follower is already in the recommended users list
        if (existingUserIndex !== -1) {
            // Get the existing follows object or an empty object if it doesn't exist
            const follows: FollowLens = recommendedUsers[existingUserIndex]?.follows ?? {followingOnLens: false, followedOnLens: false};

            // Update the follows object
            follows.followedOnLens = true;
            follows.followingOnLens = follows.followingOnLens || isFollowing;

            // Update the existing user with the new follower data
            recommendedUsers[existingUserIndex] = {
                ...follower,
                ...recommendedUsers[existingUserIndex],
                follows
            };
        } else {
            // If the follower is not in the recommended users list, add them
            recommendedUsers.push({
                ...follower,
                follows: {
                    followingOnLens: isFollowing,
                    followedOnLens: true
                }
            });
        }
    }

    // Return the list of recommended users
    return recommendedUsers;
}

export default formatLensFollowersData;