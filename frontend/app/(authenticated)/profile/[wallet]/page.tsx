"use client";
import { AskQuestionModal } from "@/components/app/[wallet]/ask-question-modal";
import { Overview } from "@/components/app/[wallet]/overview";
import { QuestionsList } from "@/components/app/[wallet]/questions-list";
import { TradeKeyModal } from "@/components/app/[wallet]/trade-key-modal";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useProfileContext } from "@/contexts/profileContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { isEVMAddress } from "@/lib/utils";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const {
    hasKeys,
    holders,
    ownedKeysCount,
    refetch: refetchProfileInfo,
    user,
    isOwnProfile,
    questions,
    questionsAsked
  } = useProfileContext();
  const router = useBetterRouter();

  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");

  const isValidWallet = useMemo(() => {
    return isEVMAddress(params.wallet);
  }, [params]);

  useEffect(() => {
    if (!isValidWallet) window.location.replace("/notfound");
  }, [isValidWallet]);

  if (!isValidWallet) return <></>;

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar withBack title={user?.displayName || undefined} />
      {router.searchParams.ask && (
        <AskQuestionModal
          refetch={() => refetchProfileInfo()}
          close={() => router.replace({ searchParams: { ask: undefined } })}
        />
      )}
      {buyModalState !== "closed" && (
        <TradeKeyModal
          supporterKeysCount={ownedKeysCount || 0}
          hasKeys={hasKeys}
          isFirstKey={isOwnProfile && holders?.length === 0}
          side={buyModalState}
          close={async () => {
            await refetchProfileInfo();
            setBuyModalState("closed");
          }}
          targetBuilderAddress={(user?.wallet as `0x${string}`) || undefined}
        />
      )}

      <Overview setBuyModalState={setBuyModalState} />
      <Tabs defaultValue={"answers"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="answers">{questions?.length} Answers</Tab>
          <Tab value="questions">{questionsAsked?.length} Questions</Tab>
        </TabList>
        <TabPanel value="answers" sx={{ p: 0 }}>
          <QuestionsList type="answers" onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
        <TabPanel value="questions" sx={{ p: 0 }}>
          <QuestionsList type="questions" onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
