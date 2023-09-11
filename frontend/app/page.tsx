'use client'
import { useAccount, useEnsName } from 'wagmi'
import { DATA, DEFAULT_PROFILE_PICTURE } from '@/lib/mock';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight } from "lucide-react"

export default function Home() {
  const router = useRouter();
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data: ensName, isError, isLoading } = useEnsName({
    address,
  });

  const builderName = (item: { wallet: string, ens_name: string}) => {
    if (!item.wallet) return ("Buidler");
    if (!item.ens_name) return (item.wallet.slice(0, 5) + "..." + item.wallet.slice(-3));
    return item.ens_name;
  }

  const price = (item: { number_of_holders: number}) => (item.number_of_holders * 0.013).toFixed(3);

  if (isConnecting) return <h1 className="text-lg font-large leading-none p-8">Connecting...</h1>
  if (isDisconnected) return <h1 className="text-lg font-large leading-none p-8">Please connect your wallet to proceed</h1>

  const sortUsers = (a: { number_of_holders: number }, b: { number_of_holders: number }) => (a.number_of_holders > b.number_of_holders) ? -1 : 1;

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
          {DATA.sort(sortUsers).map((item) => 
            <div key={`home-${item.wallet}`} className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground" onClick={() => router.push(`/${item.wallet}`)}>
              <div className="space-x-4 flex items-center">
                <Avatar className="mt-px h-5 w-5">
                  <AvatarImage src={item.profile_picture_url || DEFAULT_PROFILE_PICTURE} />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{builderName(item)}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.number_of_holders} holders | Price {price(item)} MATIC
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/${item.wallet}`)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="recommended" className="space-y-4">
          {DATA.sort(sortUsers).map((item) => 
            <div key={`home-${item.wallet}`} className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
              <div className="space-x-4 flex items-center">
                <Avatar className="mt-px h-5 w-5">
                  <AvatarImage src={item.profile_picture_url || DEFAULT_PROFILE_PICTURE} />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{builderName(item)}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.number_of_holders} holders | Price {price(item)} MATIC
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/${item.wallet}`)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}