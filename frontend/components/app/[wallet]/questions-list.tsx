"use client";
import { KeyIcon } from "@/components/icons/key";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { useProfileContext } from "@/contexts/profileContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { AccessTimeOutlined } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { FC } from "react";
import { QuestionEntry } from "./question-entry";
import QuestionModal from "./question-modal";

interface Props {
  onBuyKeyClick: () => void;
  type: "answers" | "questions";
}

export const QuestionsList: FC<Props> = ({ onBuyKeyClick, type }) => {
  const {
    isOwnProfile,
    user,
    hasKeys,
    questions,
    questionsAsked,
    isLoading,
    refetch,
    getQuestionsFromReplierQuery,
    hasLaunchedKeys
  } = useProfileContext();
  const router = useBetterRouter();
  const questionsToUse = type === "answers" ? questions : questionsAsked;
  const hasQuestion: boolean = !!questionsToUse?.length;
  // const hasQuestion: boolean = false;
  if (isLoading) {
    return <LoadingPage />;
  }

  const getMessage = () => {
    if (hasQuestion) {
      return null;
    }

    if (type === "questions") {
      if (!isOwnProfile) {
        return {
          title: "no questions to show",
          icon: <AccessTimeOutlined />,
          text: user?.displayName + " didn’t ask any questions to other builders yet"
        };
      } else {
        return {
          title: "no questions to show",
          icon: <AccessTimeOutlined />,
          text: "You haven't asked any questions to other builders yet"
        };
      }
    }

    if (!isOwnProfile) {
      if (hasLaunchedKeys) {
        if (!hasKeys) {
          return {
            title: `you don't hold any keys of ${user?.displayName}`,
            icon: <AccessTimeOutlined />,
            text: "hold " + user?.displayName + "'s keys to ask him a question"
          };
        } else {
          return {
            title: "you have a key",
            icon: <KeyIcon />,
            text: "ask the first question to " + user?.displayName,
            button: <Button onClick={() => router.push({ searchParams: { ask: true } })}>Ask question</Button>
          };
        }
      } else {
        return {
          title: "not accepting questions yet",
          icon: <AccessTimeOutlined />,
          text: user?.displayName + " didn’t create their keys, but we can notify you when they do"
        };
      }
    } else {
      if (!hasLaunchedKeys) {
        return {
          title: "Unlock Q&A",
          icon: <KeyIcon />,
          text: "Create your keys to allow others to ask you direct questions",
          button: <Button onClick={() => onBuyKeyClick()}>Create keys</Button>
        };
      } else {
        return {
          title: "no answers to show",
          icon: <AccessTimeOutlined />,
          text: "You haven't received any questions yet"
        };
      }
    }
  };

  const message = getMessage();
  if (message) {
    return (
      <Flex y m={2}>
        <PageMessage title={message.title} icon={message.icon} text={message.text} />
        {!message.button ? null : (
          <Flex y gap2 xc grow yc>
            {message.button}
          </Flex>
        )}
      </Flex>
    );
  }

  return (
    <>
      {router.searchParams.question && (
        <QuestionModal
          questionId={Number(router.searchParams.question)}
          close={() => {
            refetch();
            router.replace("./");
          }}
        />
      )}
      <Flex y grow>
        <Flex y grow sx={{ "& > div:last-child": { border: "none" } }}>
          {questionsToUse?.map(question => {
            return (
              <QuestionEntry
                key={question.id}
                question={question}
                type={"home"}
                onClick={() => router.replace({ searchParams: { question: question.id.toString() } })}
              />
            );
          })}
          <LoadMoreButton query={getQuestionsFromReplierQuery} />
        </Flex>
      </Flex>
    </>
  );
};
