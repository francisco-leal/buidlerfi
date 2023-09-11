'use client'
import { DATA, DEFAULT_PROFILE_PICTURE, DATA_TYPE } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { ChevronRight } from "lucide-react"

export function HoldersTab() {
  const router = useRouter();
  const [holders, setHolders] = useState<Array<DATA_TYPE>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    // @ts-ignore
    setHolders(DATA.filter((item) => item.number_of_votes == 0));

    // TODO: Remove after adding backend
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const builderName = (item: { wallet: string, ens_name: string}) => {
    if (!item.wallet) return ("Buidler");
    if (!item.ens_name) return (item.wallet.slice(0, 5) + "..." + item.wallet.slice(-3));
    return item.ens_name;
  }

  const price = (item: { number_of_holders: number}) => (item.number_of_holders * 0.013).toFixed(3);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full mt-24">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <>
      {holders.map((item) => 
        <div key={`holders-${item.wallet}`} className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
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
    </>
  )
}
