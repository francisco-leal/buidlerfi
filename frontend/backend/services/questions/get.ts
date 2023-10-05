import prisma from "@/lib/prisma";

const call = async (replierWallet: string, questionerWallet?: string) => {
  return await prisma.question.findMany({
    where: {
      questionerWallet: questionerWallet?.toLowerCase(),
      replierWallet: replierWallet.toLowerCase()
    }
  });
};

const GetQuestions = {
  call
};

export default GetQuestions;
