import { useUserContext } from "@/contexts/userContext";
import { useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { useGetRecommendedUser, useGetUser } from "@/hooks/useUserApi";
import { useCallback, useMemo } from "react";
import { useGetKeyRelationships } from "./useKeyRelationshipApi";

export const useUserProfile = (wallet?: string) => {
  const { user: currentUser } = useUserContext();
  const { data: holders, refetch, isLoading: isLoadingHolders } = useGetKeyRelationships(wallet, "owner");

  const {
    data: holdings,
    refetch: refetchHoldings,
    isLoading: isLoadingHoldings
  } = useGetKeyRelationships(wallet, "holder");

  const { isLoading: isLoadingRecommendedUser, data: recommendedUser } = useGetRecommendedUser(wallet as `0x${string}`);

  const { data: user, refetch: refetchUser, isLoading: isLoadingUser } = useGetUser(wallet as `0x${string}`);
  console.log(user);
  const getQuestionsFromReplierQuery = useGetQuestionsFromUser(user?.id);
  const getQuestionsFromQuestionerQuery = useGetQuestionsFromUser(user?.id, "questions");

  const sortedHolders = useMemo(
    () => holders?.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()),
    [holders]
  );

  const [myShares, supporterNumber] = useMemo(() => {
    if (!holders) return [undefined, undefined];
    const index = holders.findIndex(h => h.holder.id === currentUser?.id);
    return [holders[index], index + 1];
  }, [holders, currentUser?.id]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetch(),
      getQuestionsFromReplierQuery.refetch(),
      refetchHoldings(),
      getQuestionsFromQuestionerQuery.refetch(),
      refetchUser()
    ]);
  }, [refetch, getQuestionsFromReplierQuery, refetchHoldings, getQuestionsFromQuestionerQuery, refetchUser]);

  console.log({
    isLoadingHolders,
    getQuestions: getQuestionsFromQuestionerQuery.isLoading,
    getReplies: getQuestionsFromReplierQuery.isLoading,
    isLoadingRecommendedUser,
    isLoadingHoldings,
    isLoadingUser
  });

  const value = useMemo(() => {
    return {
      holders: sortedHolders,
      holdings,
      supporterNumber,
      ownedKeysCount: Number(myShares?.amount) || 0,
      hasKeys: (myShares && myShares.amount > BigInt(0)) || false,
      isLoading:
        isLoadingHolders ||
        (user?.id && getQuestionsFromReplierQuery.isLoading) ||
        isLoadingRecommendedUser ||
        isLoadingHoldings ||
        isLoadingUser,
      questions: getQuestionsFromReplierQuery.data,
      questionsAsked: getQuestionsFromQuestionerQuery.data,
      refetch: refetchAll,
      user,
      recommendedUser,
      isOwnProfile: currentUser?.wallet?.toLowerCase() === wallet?.toLowerCase(),
      getQuestionsFromReplierQuery,
      getQuestionsFromQuestionerQuery,
      hasLaunchedKeys: !!holdings?.find(key => key.holder.id === key.owner.id)
    };
  }, [
    sortedHolders,
    holdings,
    supporterNumber,
    myShares,
    isLoadingHolders,
    getQuestionsFromQuestionerQuery,
    getQuestionsFromReplierQuery,
    isLoadingRecommendedUser,
    isLoadingHoldings,
    isLoadingUser,
    refetchAll,
    user,
    recommendedUser,
    currentUser?.wallet,
    wallet
  ]);

  return value;
};
