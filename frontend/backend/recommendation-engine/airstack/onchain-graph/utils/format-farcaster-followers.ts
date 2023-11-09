import {FarcasterFollowerAddress, FollowFarcaster, RecommendedUser} from "../interfaces/recommended-user";

// This function formats the data of Farcaster followers
function formatFarcasterFollowersData(followers: FarcasterFollowerAddress[], existingUsers: RecommendedUser[] = []): FarcasterFollowerAddress[] {
    if (!followers || followers?.length === 0) {
        return [...existingUsers]
    }

    // Initialize an array to store the recommended users
    const recommendedUsers: FarcasterFollowerAddress[] = [...existingUsers];

    // Loop through each follower
    for (let i = 0; i < followers.length; i++){
        const follower = followers[i];

        // Find the index of the follower in the recommendedUsers array
        const existingUserIndex = recommendedUsers.findIndex(
            ({ addresses: recommendedUsersAddresses }) =>
                // Check if the follower's address is in the recommended user's addresses
                recommendedUsersAddresses?.some?.(address =>
                    follower.addresses?.includes?.(address)
                )
        );

        // Check if the follower is following any users
        const following = Boolean(follower?.mutualFollowing?.Follower?.length);

        // If the follower is already in the recommendedUsers array
        if (existingUserIndex !== -1) {
            // Get the follow object of the existing user
            const follows: FollowFarcaster = recommendedUsers?.[existingUserIndex]?.follows ?? {followedOnFarcaster: false, followingOnFarcaster: false};

            // Update the follow object
            follows.followedOnFarcaster = true;
            follows.followingOnFarcaster = follows.followingOnFarcaster || following;

            // Update the existing user in the recommendedUsers array
            recommendedUsers[existingUserIndex] = {
                ...follower,
                ...recommendedUsers[existingUserIndex],
                follows
            };
        } else {
            // If the follower is not in the recommendedUsers array, add them
            recommendedUsers.push({
                ...follower,
                follows: {
                    followingOnFarcaster: following,
                    followedOnFarcaster: true
                }
            });
        }
    }

    // Return the array of recommended users
    return recommendedUsers;
}

export default formatFarcasterFollowersData;