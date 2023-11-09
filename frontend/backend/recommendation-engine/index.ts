import 'dotenv/config';
import { init } from '@airstack/node';

import { fetchOnChainGraphData } from './airstack/onchain-graph';

export const main = async () => {
  init(process.env.AIRSTACK_API_KEY!, 'dev');
  console.time('start');

  const address = process.argv?.length > 2 ? process.argv[2] : '0x1358155a15930f89eBc787a34Eb4ccfd9720bC62';
  if (!address.includes('.eth') && !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(`${address} is not a valid address. Make sure it's either a valid Ethereum address or ENS.`);
  }

  console.log(`Fetching Onchain Graph Data for ${address}`);
  const recommendedUsers = await fetchOnChainGraphData(address);

  console.timeEnd('start');
  return recommendedUsers;
};

main().then(() => {
  process.exit(0);
});
