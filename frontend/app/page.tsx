'use client'
import { useAccount } from 'wagmi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from "lucide-react"
import { Icons } from '@/components/ui/icons';
import { GraphContext } from '@/lib/context';
import { useContext, useState, useEffect } from 'react';
import { UserItem } from '@/components/user-item';

export default function Home() {
  const [users, setUsers] = useState<any>([]);
  const { address, isConnecting, isDisconnected } = useAccount()
  const graphContext = useContext(GraphContext)

  useEffect(() => {
    //@ts-ignore
    if (!graphContext.graphData) return;

    //@ts-ignore
    setUsers(graphContext.graphData.shareParticipants);

    //@ts-ignore
  }, [graphContext.graphData])

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Icons.spinner className="text-muted-foreground h-32 w-32 animate-spin mb-6" />
        <p>Connecting...</p>
      </div>
    )
  }

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Wallet className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Please connect your wallet to proceed.</p>
      </div>
    )
  }

  const sortUsers = (a: { numberOfHolders: number }, b: { numberOfHolders: number }) => (a.numberOfHolders > b.numberOfHolders) ? -1 : 1;

  return (
    <main className="py-4 px-2">
      <Tabs defaultValue="recommended" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="top">
            Top
          </TabsTrigger>
          <TabsTrigger value="recommended">
            Recommended
          </TabsTrigger>
        </TabsList>
        <TabsContent value="top" className="space-y-4">
          {users.sort(sortUsers).map((item: any) => 
            <UserItem item={item} key={`home-${item.owner}`} />
          )}
        </TabsContent>
        <TabsContent value="recommended" className="space-y-4 pb-16">
          {users.sort(sortUsers).map((item: any) => 
            <UserItem item={item} key={`home-${item.owner}`} />
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}