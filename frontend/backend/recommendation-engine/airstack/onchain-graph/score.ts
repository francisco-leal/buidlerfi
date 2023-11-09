import {PoapUser} from "./functions/fetch-poaps";
import {
    FarcasterFollowerAddress,
    FarcasterFollowingAddress,
    LensFollowerAddress,
    LensFollowingAddress
} from "./interfaces/recommended-user";

const defaultScoreMap = {
    followedByOnLens: 3,
    followingOnLens: 5,
    followedByOnFarcaster: 3,
    followingOnFarcaster: 5,
    commonPoaps: 7,
};

const identityMap = (identities) =>
    identities.reduce((acc, identity) => {
        acc[identity] = true;
        return acc;
    }, {});

const isBurnedAddress = (address: string) => {
    if (!address) {
        return false;
    }
    address = address.toLowerCase();
    return (
        address === "0x0000000000000000000000000000000000000000" ||
        address === "0x000000000000000000000000000000000000dead"
    );
};

const calculatingScore = (user: PoapUser | FarcasterFollowerAddress | FarcasterFollowingAddress | LensFollowingAddress | LensFollowerAddress, scoreMap = defaultScoreMap): (PoapUser | FarcasterFollowerAddress | FarcasterFollowingAddress | LensFollowingAddress | LensFollowerAddress) & {_score: number} => {
    const identities = [user];
    if (
        user.addresses?.some((address) => identityMap(identities)[address]) ||
        user.domains?.some(({name}) => identityMap(identities)[name]) ||
        user.addresses?.some((address) => isBurnedAddress(address))
    ) {
        return null;
    }

    let score = 0;
    if ((user as LensFollowingAddress).follows?.followingOnLens) {
        score += scoreMap.followingOnLens;
    }
    if ((user as LensFollowerAddress).follows?.followedOnLens) {
        score += scoreMap.followedByOnLens;
    }
    if ((user as FarcasterFollowingAddress).follows?.followingOnFarcaster) {
        score += scoreMap.followingOnFarcaster;
    }
    if ((user as FarcasterFollowerAddress).follows?.followedOnFarcaster) {
        score += scoreMap.followedByOnFarcaster;
    }
    if ((user as PoapUser).poaps) {
        score += scoreMap.commonPoaps * (user as PoapUser).poaps.length;
    }

    return {
        ...user,
        _score: score,
    };
};

export default calculatingScore;