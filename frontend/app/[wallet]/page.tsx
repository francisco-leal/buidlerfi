'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from './components/overview';
import { HoldingTab } from './components/holding-tab';
import { HoldersTab } from './components/holders-tab';
import { ChatTab } from './components/chat-tab';

export default function ProfilePage({ params }: { params: { wallet: string } }) {
  return (
    <main className="py-4 px-2">
      <Overview wallet={params.wallet}/>
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
