import fetchFarcasterFollowers from './functions/fetch-farcaster-followers';
import fetchFarcasterFollowings from './functions/fetch-farcaster-followings';
import fetchLensFollowers from './functions/fetch-lens-followers';
import fetchLensFollowings from './functions/fetch-lens-followings';
import fetchPoapsData from './functions/fetch-poaps';
import { fetchTalentProtocolConnectionsData } from './functions/fetch-talent-protocol-connections';
import { RecommendedUser } from './interfaces/recommended-user';
import calculatingScore from './score';
import sortByScore from './sort';

export const fetchOnChainGraphData = async (address: string) => {
  let recommendedUsers: RecommendedUser[] = [];

  console.log('Fetching Common Poaps Holders...');
  recommendedUsers = await fetchPoapsData(address);

  console.log('Fetching Farcaster Followings...');
  recommendedUsers = await fetchFarcasterFollowings(address, recommendedUsers);

  console.log('Fetching Lens Followings...');
  recommendedUsers = await fetchLensFollowings(address, recommendedUsers);

  console.log('Fetching Farcaster Followers...');
  recommendedUsers = await fetchFarcasterFollowers(address, recommendedUsers);

  console.log('Fetching Lens Followers...');
  recommendedUsers = await fetchLensFollowers(address, recommendedUsers);

  console.log('Fetching TalentProtocol connections...');
  recommendedUsers = await fetchTalentProtocolConnectionsData(address, recommendedUsers);

  console.log('Computing score...');
  const onChainGraphUsersWithScore = recommendedUsers.map((user) => calculatingScore(user)).filter(Boolean);

  console.log('Sorting recommended users by score...');
  return sortByScore(onChainGraphUsersWithScore);
};
