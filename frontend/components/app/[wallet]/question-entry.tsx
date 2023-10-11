import { Flex } from "@/components/shared/flex";
import { usePutQuestion } from "@/hooks/useQuestionsApi";
import theme from "@/theme";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Button, Textarea, Typography } from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import { Question } from "@prisma/client";
import { FC, useLayoutEffect, useRef, useState } from "react";

interface Props {
  question: Question;
  isOwnChat: boolean;
  refetch: () => void;
}
export const QuestionEntry: FC<Props> = ({ question, isOwnChat, refetch }) => {
  const answerRef = useRef<HTMLDivElement>(null);

  const [isAnswerTooLong, setIsAnswerTooLong] = useState(false);
  const [reply, setReply] = useState("");
  const [isShowMore, setIsShowMore] = useState(false);
  const putQuestion = usePutQuestion();

  const replyQuestion = async () => {
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    refetch();
  };

  useLayoutEffect(() => {
    if (answerRef.current && answerRef.current.clientWidth < answerRef.current.scrollWidth) {
      setIsAnswerTooLong(true);
    }
  }, [answerRef]);

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Flex
      p={1}
      y
      gap1={!question.answerContent}
      key={question.id}
      sx={{ borderBottom: theme => "1px solid " + theme.palette.divider, borderRadius: "8px" }}
    >
      <Typography fontWeight={500} level="body-md" whiteSpace="pre-line">
        {question.questionContent}
      </Typography>
      {question.answerContent || !isOwnChat ? (
        <Flex y gap2>
          <Typography
            ref={answerRef}
            sx={{
              borderLeft: theme => "2px solid " + theme.palette.neutral[400],
              whiteSpace: isShowMore ? "pre-line" : "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            px={2}
            ml={0.5}
            textColor="neutral.500"
            level="body-sm"
            maxWidth="100%"
          >
            {question.answerContent || "Waiting for answer"}
          </Typography>
          {isAnswerTooLong && (
            <Button
              size="sm"
              variant="plain"
              onClick={() => setIsShowMore(curr => !curr)}
              startDecorator={isShowMore ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              sx={{ mb: -1 }}
            >
              {isShowMore ? "Show less" : "Show more"}
            </Button>
          )}
        </Flex>
      ) : (
        <Flex y={isSm} yc gap2>
          <Textarea
            sx={{ flexGrow: 1 }}
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your reply here"
          />
          <Button className="appearance-none" loading={putQuestion.isLoading} onClick={() => replyQuestion()}>
            Post answer
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
