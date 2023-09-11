'use client'
import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { getEnsName } from 'viem/ens';
import { isAddress } from 'viem';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Icons } from '@/components/ui/icons'
import { useToast } from "@/components/ui/use-toast"

export function Overview({ wallet }: { wallet: string }) {
  const publicClient = usePublicClient()
  const { address, isConnecting, isDisconnected } = useAccount()
  const [ensName, setENSName] = useState("");
  const [price, setPrice] = useState(0.01);
  const [holders, setHolders] = useState("10");
  const [holdings, setHoldings] = useState("1");
  const [supporterNumber, setSupporterNumber] = useState(1);
  const [supporterKeys, setSupporterKeys] = useState(0);
  const [isSupporting, setIsSupporting] = useState(false);
  const [buyingKeys, setBuyingKeys] = useState(false);
  const [sellingKeys, setSellingKeys] = useState(false);
  const [openBuy, setOpenBuy] = useState(false);
  const { toast } = useToast()
  
  const builderName = () => {
    if (!address) return ("Buidler");
    if (!ensName) return (address.slice(0, 4) + "..." + address.slice(-2));
    return ensName;
  }

  const shortAddress = () => {
    if (!address || !ensName) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  useEffect(() => {
    if (wallet && isAddress(wallet as string)) {
      // @ts-ignore
      getEnsName(publicClient, { address: wallet })
        .then((name) => {
          if (name) {
            setENSName(name);
          }
        });
    }
  }, [wallet])

  const buyKeys = async () => {
    setBuyingKeys(true)

    setTimeout(() => {
      setOpenBuy(false)
      setBuyingKeys(false)
      toast({
        title: "Key bought!",
        description: `You bought a key of ${builderName()}.`,
      })
    }, 3000)
  }

  const sellKeys = async () => {
    setSellingKeys(true)

    setTimeout(() => {
      setOpenBuy(false)
      setSellingKeys(false)
      toast({
        title: "Key sold!",
        description: `You sold a key of ${builderName()}.`,
      })
    }, 3000)
  }

  const calculateBuyPrice = () => {
    return price;
  }

  const calculateSellPrice = () => {
    return price;
  }

  const holderNumberText = () => {
    if (supporterNumber > 0) {
      return `You are holder #${supporterNumber}`;
    } else {
      return "You don't hold any key";
    }
  }

  return (
    <>
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold	 leading-none">{builderName()}</h2>
        <p className="text-xs text-muted-foreground">{shortAddress()}</p>
      </div>
      <div className="space-x-2">
        <AlertDialog open={openBuy} onOpenChange={() => setOpenBuy(true)}>
          <AlertDialogTrigger>
            <Button>{isSupporting ? "Trade" : "Buy"}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='w-11/12'>
            <AlertDialogHeader>
              <AlertDialogTitle>{isSupporting ? "Trade":"Buy"} Keys</AlertDialogTitle>
              <div className="flex flex-col pt-8">
                <div className="flex items-center justify-between">
                  <p className="font-medium leading-none">{builderName()}</p>
                  <p className="leading-none">{calculateBuyPrice()} MATIC</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">{supporterKeys > 0 ? `You own ${supporterKeys} keys` : "You don't own any keys"}</p>
                  <p className="text-sm text-muted-foreground">Key price</p>
                </div>
                <Button onClick={() => buyKeys()} disabled={buyingKeys || sellingKeys} className='mt-4'>
                  {buyingKeys && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Buy a key
                </Button>
                {
                  supporterKeys > 0 && (<>
                    <Button variant="outline" onClick={() => sellKeys()} disabled={buyingKeys || sellingKeys} className="mt-2">
                      {sellingKeys && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Sell a key
                    </Button>
                    <div className="flex items-center justify-center mt-2">
                      <p className="text-sm text-muted-foreground">Sell price: {calculateSellPrice()}</p>
                    </div>
                  </>)
                }
                <Button variant="ghost" onClick={() => setOpenBuy(false)} disabled={buyingKeys || sellingKeys} className="mt-2">
                  Cancel
                </Button>
              </div>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    <div className="flex items-center justify-between mt-4">
      <p className="text-base font-medium">{holderNumberText()}</p>
      <p className="text-base font-medium">{price} MATIC</p>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">{holders} holders</p>
        <p className="text-sm text-muted-foreground">{holdings} holding</p>
      </div>
      <p className="text-sm text-muted-foreground">Key price</p>
    </div>
    </>
  )
}
