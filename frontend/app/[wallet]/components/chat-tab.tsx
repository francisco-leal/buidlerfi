"use client";
import { Lock, MessageSquare } from "lucide-react";
import { useContractRead, useAccount, usePublicClient } from "wagmi";
import abi from "@/lib/abi/BuidlerFiV1.json";
import { MUMBAI_ADDRESS } from "@/lib/address";
import { useEffect, useState } from "react";
import { getEnsName } from "viem/ens";
import { isAddress } from "viem";
import { Button } from "@/components/ui/button";
import axios from "axios";

export function ChatTab({ wallet }: { wallet: string }) {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [ensName, setENSName] = useState("");
  const { data: supporterKeys } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: "sharesBalance",
    args: [wallet, address]
  });
  const publicClient = usePublicClient();

  useEffect(() => {
    if (wallet && isAddress(wallet as string)) {
      // @ts-ignore
      getEnsName(publicClient, { address: wallet }).then(name => {
        if (name) {
          setENSName(name);
        }
      });
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet && address) {
      getQuestions(wallet, address);
    }
  }, [wallet, address]);

  const getQuestions = async (wallet: string, address: string | undefined) => {
    const response = await axios.get(`/api/questions?questionerWallet=${address}&replierWallet=${wallet}`);

    console.log(response.data);
  };

  const builderName = () => {
    if (!wallet) return "Buidler";
    if (!ensName) return wallet.slice(0, 12) + "..." + wallet.slice(-10);
    return ensName;
  };

  const sendQuestion = async (questionContent: string) => {
    const response = await axios.post("/api/questions", {
      questionContent,
      replierWallet: wallet,
      questionerWallet: address
    });

    console.log(response.data);
  };

  const sendReply = async (questionId: number, questionAnswer: string) => {
    const response = await axios.put(`/api/questions/${questionId}`, {
      questionAnswer
    });

    console.log(response.data);
  };

  if (supporterKeys == 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Lock className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Hold atleast one key to access the chat.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-24">
        <MessageSquare className="text-muted-foreground h-32 w-32 mb-6" />
        <p className="text-center mb-10">Congratulations. You can now chat with {builderName()}</p>

        <Button onClick={() => sendQuestion("Fake question")}>Send message</Button>
      </div>
    </>
  );
}
