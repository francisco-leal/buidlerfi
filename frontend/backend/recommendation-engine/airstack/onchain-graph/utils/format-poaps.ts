import {PoapHolder, PoapUser} from "../functions/fetch-poaps";
import {PoapRecommendedUser, RecommendedUser} from "../interfaces/recommended-user";

// Function to format POAP data
function formatPoapsData(poapHolders: PoapHolder[], existingUsers: RecommendedUser[] = []): PoapRecommendedUser[] {
    if (!poapHolders || poapHolders?.length === 0) {
        return [...existingUsers];
    }

    // Initialize an array to store the recommended users
    const recommendedUsers: PoapUser[] = [...existingUsers];

    // Iterate over each POAP
    for (let i = 0; i < poapHolders.length; i++){
        const poap = poapHolders[i];
        // Destructure the POAP data
        const { attendee, poapEvent, eventId } = poap;
        const { eventName: name, contentValue } = poapEvent;
        const { addresses } = attendee.owner;

        // Find the index of the user in the recommended users list
        const existingUserIndex = findUserIndex(recommendedUsers, addresses);

        // If the user is already in the recommended users list
        if (existingUserIndex !== -1) {
            recommendedUsers[existingUserIndex].addresses = [
                ...(recommendedUsers?.[existingUserIndex]?.addresses ?? []),
                ...(addresses ?? []),
            ]?.filter((address, index, array) => array.indexOf(address) === index);
            const _poaps = recommendedUsers?.[existingUserIndex]?.poaps || [];
            const poapExists = _poaps.some((_poap) => _poap.eventId === eventId);
            if (!poapExists) {
                _poaps?.push({ name, image: contentValue?.image?.extraSmall, eventId });
                recommendedUsers[existingUserIndex].poaps = [..._poaps];
            } } else {
            // If the user is not in the recommended users list, add them
            recommendedUsers.push({
                ...attendee?.owner,
                poaps: [{ name, image: contentValue?.image?.extraSmall, eventId }],
            });
        }
    }

    // Return the list of recommended users
    return recommendedUsers;
}

// Function to find the index of a user in a list of users
function findUserIndex(users: PoapUser[], addresses: string[] = []): number {
    // Return the index of the user whose address is in the provided addresses
    return users.findIndex(
        ({ addresses: userAddresses }) => userAddresses?.some(address => addresses.includes(address))
    );
}
export default formatPoapsData;