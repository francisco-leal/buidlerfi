import { GetFollowersResponse } from "@/app/api/airstack/followers/route";
import { GetWalletSocialsResponse } from "@/app/api/airstack/social/route";
import { ApiResponse } from "@/models/apiResponse.model";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetSocialFollowers = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  return useQuery(
    ["useGetSocialFollowers", address],
    () =>
      axios
        .get<ApiResponse<GetFollowersResponse>>("api/airstack/followers", { params: { address } })
        .then(res => res.data.data),
    {
      enabled: !!address,
      ...options
    }
  );
};

export const useGetWalletSocials = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  return useQuery(
    ["useGetWalletSocials", address],
    () =>
      axios
        .get<ApiResponse<GetWalletSocialsResponse>>("api/airstack/social", { params: { address } })
        .then(res => res.data.data),
    {
      enabled: !!address,
      ...options
    }
  );
};
