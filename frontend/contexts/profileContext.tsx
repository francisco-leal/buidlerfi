import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
import { useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { useGetRecommendedUser, useGetUser } from "@/hooks/useUserApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams } from "next/navigation";
import { ReactNode, createContext, useContext } from "react";

interface ProfileContextType {
  holders: ReturnType<typeof useGetKeyRelationships>["data"];
  holdings: ReturnType<typeof useGetKeyRelationships>["data"];
  supporterNumber?: number;
  ownedKeysCount: number;
  hasKeys: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  user?: ReturnType<typeof useGetUser>["data"];
  recommendedUser?: ReturnType<typeof useGetRecommendedUser>["data"];
  isOwnProfile: boolean;
  questions: ReturnType<typeof useGetQuestionsFromUser>["data"];
  questionsAsked: ReturnType<typeof useGetQuestionsFromUser>["data"];
  getQuestionsFromReplierQuery?: ReturnType<typeof useGetQuestionsFromUser>;
  getQuestionsFromQuestionerQuery?: ReturnType<typeof useGetQuestionsFromUser>;
  hasLaunchedKeys: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  hasKeys: false,
  holders: [],
  holdings: [],
  ownedKeysCount: 0,
  supporterNumber: 0,
  isLoading: true,
  refetch: () => Promise.resolve(),
  questions: [],
  questionsAsked: [],
  isOwnProfile: false,
  hasLaunchedKeys: false
});

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { wallet } = useParams();
  const value = useUserProfile((wallet as string).toLowerCase());

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
