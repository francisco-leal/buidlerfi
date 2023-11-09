import { TalentProtocolConnectionType } from '../../../talent-protocol';

export interface FollowLens {
  followingOnLens: boolean;
  followedOnLens: boolean;
}

export interface FollowFarcaster {
  followingOnFarcaster: boolean;
  followedOnFarcaster: boolean;
}

export interface FollowTalentProtocol {
  followingOnTalentProtocol: boolean;
  followedOnTalentProtocol: boolean;
}

export interface RecommendedUser {
  addresses?: string[];
  domains?: {
    name: string;
    isPrimary: boolean;
  }[];
  socials?: {
    dappName: string;
    blockchain: string;
    profileName: string;
    profileImage: string;
    profileTokenId: string;
    profileTokenAddress: string;
  }[];
  xmtp?: {
    isXMTPEnabled?: boolean;
  };
}

export interface TalentProtocolRecommendedUser extends RecommendedUser {
  follows?: FollowTalentProtocol;
  connectionType?: TalentProtocolConnectionType;
}

export interface PoapRecommendedUser extends RecommendedUser {
  poaps?: {
    name: string;
    image?: string;
    eventId: string;
  }[];
}

export interface FarcasterFollowerAddress extends RecommendedUser {
  mutualFollowing?: {
    Follower: {
      followingAddress: {
        socials: {
          profileName: string;
        };
      };
    }[];
  };
  follows?: FollowFarcaster;
}

export interface FarcasterFollowingAddress extends RecommendedUser {
  mutualFollowing?: {
    Following: {
      followerAddress: {
        socials: {
          profileName: string;
        };
      };
    }[];
  };
  follows?: FollowFarcaster;
}

export interface LensFollowerAddress extends RecommendedUser {
  mutualFollowing?: {
    Following: {
      followingAddress: {
        socials: {
          profileName: string;
        };
      };
    }[];
  };
  follows?: FollowLens;
}

export interface LensFollowingAddress extends RecommendedUser {
  mutualFollowing?: {
    Following: {
      followerAddress: {
        socials: {
          profileName: string;
        };
      };
    }[];
  };
  follows?: FollowLens;
}
