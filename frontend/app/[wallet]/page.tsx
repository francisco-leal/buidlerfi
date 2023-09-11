'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './components/overview-tab';
import { HoldingTab } from './components/holding-tab';
import { HoldersTab } from './components/holders-tab';

export default function ProfilePage({ params }: { params: { wallet: string } }) {
  return (
    <main className="py-4 px-2">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="holding">
            Holding
          </TabsTrigger>
          <TabsTrigger value="holders">
            Holders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab wallet={params.wallet}/>
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
