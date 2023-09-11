'use client'
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from './components/overview';
import { HoldingTab } from './components/holding-tab';
import { HoldersTab } from './components/holders-tab';
import { ChatTab } from './components/chat-tab';
import { useContractRead } from 'wagmi'
import abi from "@/lib/abi/BuidlerFiV1.json";
import { MUMBAI_ADDRESS } from '@/lib/address';

export default function ProfilePage({ params }: { params: { wallet: string } }) {
  const { data: totalSupply, isLoading: supplyLoading } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'sharesSupply',
    args: [params.wallet]
  });

  const { data: buyPrice, isLoading: priceLoading } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'getBuyPrice',
    args: [params.wallet]
  });

  const { data: buyPriceAfterFee } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'getBuyPriceAfterFee',
    args: [params.wallet]
  });

  const { data: sellPrice } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'getSellPrice',
    args: [params.wallet, 1]
  });

  return (
    <main className="py-4 px-2">
      <Overview
        wallet={params.wallet}
        buyPrice={buyPrice}
        totalSupply={totalSupply}
        buyPriceAfterFee={buyPriceAfterFee}
        sellPrice={sellPrice}
      />
      <Tabs defaultValue="chat" className="space-y-4 mt-4 pb-16">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="chat">
            Chat
          </TabsTrigger>
          <TabsTrigger value="holding">
            Holding
          </TabsTrigger>
          <TabsTrigger value="holders">
            Holders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="space-y-4">
          <ChatTab wallet={params.wallet}/>
        </TabsContent>
        <TabsContent value="holding" className="space-y-4">
          <HoldingTab />
        </TabsContent>
        <TabsContent value="holders" className="space-y-4">
          <HoldersTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
