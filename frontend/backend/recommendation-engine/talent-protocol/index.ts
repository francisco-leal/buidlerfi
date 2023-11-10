import axios, { AxiosRequestConfig, Method } from "axios";

import { FollowTalentProtocol } from "../airstack/onchain-graph/interfaces/recommended-user";

export enum TalentProtocolConnectionType {
  MUTUAL = 'mutual_subscription',
  SUBSCRIBER = 'subscriber',
  SUBSCRIBING = 'subscribing',
}

export interface TalentProtocolConnection {
  username: string;
  name: string;
  // eslint-disable-next-line camelcase
  wallet_address: string;
  // eslint-disable-next-line camelcase
  user_invested_amount: string;
  // eslint-disable-next-line camelcase
  connected_user_invested_amount: string;
  // eslint-disable-next-line camelcase
  connection_type: TalentProtocolConnectionType;
  // eslint-disable-next-line camelcase
  connected_at: string;
  // eslint-disable-next-line camelcase
  profile_picture_url: string;
}

export const paginateTalentProtocolApiRequest = async <T>(
  method: Method,
  url: string,
  queryParams: { key: string; value: string }[] = [],
  handleResponse: (data: Record<string, never> & {pagination: {next_cursor?: string}}) => { items: T[]; nextCursor?: string }
): Promise<T[]> => {
  let result: T[] = [];
  const parsedUrl = new URL(url);

  // Append query parameters to the URL
  queryParams.forEach((param) => {
    parsedUrl.searchParams.append(param.key, param.value);
  });

  let response;
  do {
    const config: AxiosRequestConfig = {
      method,
      url: parsedUrl.href,
      headers: { 'X-API-KEY': process.env.TALENT_PROTOCOL_API_KEY },
    };

    // Make the request using the config
    response = await axios.request(config).catch((e) => {
      console.error(e);
      return null;
    });

    if (!response) break;

    const { items, nextCursor }: {items: T[], nextCursor?: string} = handleResponse(response.data);
    result = result.concat(items);

    // Update the URL with the new cursor if it exists
    if (nextCursor) {
      parsedUrl.searchParams.set("next_cursor", nextCursor);
    }
  } while (response && response.data && response.data.length > 0 && handleResponse(response.data as never).nextCursor);

  return result;
};

export const fetchTalentProtocolConnections = async (address: string): Promise<TalentProtocolConnection[]> =>
  paginateTalentProtocolApiRequest<TalentProtocolConnection>(
    'get',
    'https://api.talentprotocol.com/api/v1/connections',
    [
      {
        key: 'id',
        value: address,
      },
    ],
    (data) => {
      const items = data.connections || [];
      const nextCursor = data.pagination?.next_cursor;
      return { items, nextCursor };
    }
  );

export const talentProtocolConnectionTypeToFollowObject = (
  connectionType: TalentProtocolConnectionType
): FollowTalentProtocol => {
  switch (connectionType) {
    case TalentProtocolConnectionType.MUTUAL:
      return {
        followedOnTalentProtocol: true,
        followingOnTalentProtocol: true,
      };
    case TalentProtocolConnectionType.SUBSCRIBER:
      return {
        followedOnTalentProtocol: true,
        followingOnTalentProtocol: false,
      };
    case TalentProtocolConnectionType.SUBSCRIBING:
      return {
        followedOnTalentProtocol: false,
        followingOnTalentProtocol: true,
      };
    default:
      return {
        followedOnTalentProtocol: false,
        followingOnTalentProtocol: false,
      };
  }
};
