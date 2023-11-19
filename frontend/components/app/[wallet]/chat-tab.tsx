"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { useGetQuestions, usePostQuestion } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BUILDERFI_CONTRACT, MAX_QUESTION_SIZE } from "@/lib/constants";
import theme from "@/theme";
import { Chat, KeyOutlined, LockOpen, LockOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Textarea, Typography } from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import { FC, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { QuestionEntry } from "./question-entry";

interface Props {
  socialData: SocialData;
  isOwnProfile: boolean;
  onBuyKeyClick: () => void;
}

export const ChatTab: FC<Props> = ({ socialData, isOwnProfile, onBuyKeyClick }) => {
  const [chatValue, setChatValue] = useState<string>("");
  const { address } = useAccount();
  const { data: supporterKeys } = useContractRead({
    address: BUILDERFI_CONTRACT.address,
    abi: builderFIV1Abi,
    functionName: "builderKeysBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const ownsKeys = supporterKeys !== undefined && supporterKeys > BigInt(0);

  const { data: questions, refetch, isLoading } = useGetQuestions(socialData.address);

  const postQuestion = usePostQuestion();

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const sendQuestion = async () => {
    if (!address) return;

    await postQuestion.mutateAsync({
      questionContent: chatValue,
      replierWallet: socialData.address
    });
    await refetch();
    setChatValue("");
  };

  if (!ownsKeys && !isOwnProfile && !questions?.length) {
    return (
      <PageMessage
        title="Unlock Q&A"
        icon={<LockOutlined />}
        text={`Hold at least one key to ask ${socialData.name} a question and access the answers`}
      />
    );
  }

  if (!ownsKeys && isOwnProfile) {
    return (
      <Flex y gap2 xc grow yc>
        <PageMessage
          title={"Unlock Q&A"}
          icon={<KeyOutlined />}
          text="Create your keys to allow others to ask you direct questions."
          sx={{ flexGrow: 0 }}
        />
        <Button onClick={() => onBuyKeyClick()}>Create keys</Button>
      </Flex>
    );
  }

  if (isOwnProfile && !questions?.length) {
    return (
      <PageMessage
        title="You don't have any questions"
        icon={<Chat />}
        text="Your Q&A will appear here as soon as one of your holders asks you a question"
      />
    );
  }

  if (isLoading) {
    return (
      <Flex y xc yc grow>
        <CircularProgress />
      </Flex>
    );
  }

  return (
    <Flex y grow>
      {!isOwnProfile && ownsKeys && (
        <Flex y gap={0.5} p={2} borderBottom={"1px solid " + theme.palette.divider}>
          <Flex y={isSm} yc gap2>
            <Textarea
              value={chatValue}
              onChange={e => setChatValue(e.target.value)}
              error={chatValue.length > MAX_QUESTION_SIZE}
              placeholder={`Ask a question to ${socialData.name}`}
              sx={{ flexGrow: 1 }}
            />
            <Button
              disabled={chatValue.length > MAX_QUESTION_SIZE}
              className="appearance-none"
              loading={postQuestion.isLoading}
              onClick={() => sendQuestion()}
            >
              Ask
            </Button>
          </Flex>
          <Typography level="body-sm">{chatValue.length}/MAX_QUESTION_SIZE</Typography>
        </Flex>
      )}
      <Flex y grow>
        {ownsKeys && !questions?.length ? (
          <PageMessage text={`Congratulations. You can now chat with ${socialData.name}`} icon={<LockOpen />} />
        ) : (
          questions?.map((question, i) => {
            return (
              <QuestionEntry
                key={question.id}
                socialData={socialData}
                question={question}
                isOwnChat={isOwnProfile}
                ownsKeys={ownsKeys}
                refetch={refetch}
                index={`${questions.length - i}/${questions.length}`}
              />
            );
          })
        )}
      </Flex>
    </Flex>
  );
};
