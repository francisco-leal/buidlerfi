import { FollowerStructure } from "@/app/api/airstack/followers/route";

export const parseFollower = (follower: FollowerStructure) => {
  const owner = follower.followerAddress.addresses.find(address => address.startsWith("0x"));

  return {
    id: follower.followerAddress.identity,
    owner,
    dappName: follower.dappName
  };
};
