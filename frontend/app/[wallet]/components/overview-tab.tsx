'use client'
import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { getEnsName } from 'viem/ens';
import { isAddress } from 'viem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Icons } from '@/components/ui/icons'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from "@/components/ui/use-toast"
import { Separator } from '@/components/ui/separator';

export function OverviewTab({ wallet }: { wallet: string }) {
  const publicClient = usePublicClient()
  const { address, isConnecting, isDisconnected } = useAccount()
  const [ensName, setENSName] = useState("");
  const [price, setPrice] = useState(0.01);
  const [holders, setHolders] = useState("10");
  const [holdings, setHoldings] = useState("1");
  const [supporterNumber, setSupporterNumber] = useState("1");
  const [supporterKeys, setSupporterKeys] = useState("3");
  const [isSupporting, setIsSupporting] = useState(true);
  const [buyingShares, setBuyingShares] = useState(false);
  const [amountToBuy, setAmountToBuy] = useState("1");
  const [openBuy, setOpenBuy] = useState(false);
  const { toast } = useToast()
  
  const builderName = () => {
    if (!address) return ("Buidler");
    if (!ensName) return (address.slice(0, 4) + "..." + address.slice(-2));
    return ensName;
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

  const buyShares = async () => {
    setBuyingShares(true)

    setTimeout(() => {
      setOpenBuy(false)
      setBuyingShares(false)
      toast({
        title: "Shares bought!",
        description: `You bought ${amountToBuy} shares of ${builderName()}.`,
      })
    }, 3000)
  }

  const calculateBuyPrice = () => {
    const totalPrice = price * parseFloat(amountToBuy)

    if (Number.isNaN(totalPrice)) {
      return price
    } else {
      return totalPrice;
    }
  }

  return (
    <>
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-medium leading-none">{builderName()}</h2>
      <div className="space-x-2">
        <AlertDialog open={openBuy} onOpenChange={() => setOpenBuy(true)}>
          <AlertDialogTrigger>
            <Button>Buy Shares</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Buy Shares of {builderName()}</AlertDialogTitle>
              <div className="grid gap-2">
                <div className="grid gap-1 my-4">
                  <Label htmlFor="shareAmount">
                    How many shares do you want to buy?
                  </Label>
                  <Input
                    id="shareAmount"
                    type="number"
                    autoCapitalize="none"
                    autoComplete="number"
                    autoCorrect="off"
                    disabled={buyingShares}
                    value={amountToBuy}
                    onChange={(event) => setAmountToBuy(event.currentTarget.value)}
                  />
                  <Separator className='my-4'/>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Price per share
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {price} MATIC
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Total 
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calculateBuyPrice()} MATIC + gas
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>
              <Button disabled={buyingShares} onClick={() => buyShares()}>
                {buyingShares && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Buy
              </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button disabled={!isSupporting} variant={"secondary"}>Sell Shares</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                <h1>Just a test for more stuff inside</h1>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    <div className="flex items-center space-x-2 mt-4">
      <p className="text-sm text-muted-foreground">Current Price:</p>
      <p className="text-sm font-medium">{price} MATIc</p>
    </div>
    <div className="flex items-center space-x-4 mt-4">
      <p className="text-sm text-muted-foreground">{holders} holders</p>
      <p className="text-sm text-muted-foreground">{holdings} holding</p>
    </div>
    {isSupporting && (
      <>
        <div className="flex items-center space-x-4 mt-4">
          <p className="text-sm text-muted-foreground">Your supporter number is: {supporterNumber}</p>
        </div>
        <div className="flex items-center space-x-4 mt-4">
          <p className="text-sm text-muted-foreground">You own {supporterKeys} keys</p>
        </div>
      </>
    )}
    {!isSupporting && (
      <div className="flex items-center space-x-4 mt-4">
        <p className="text-sm text-muted-foreground">Purchase {builderName()} keys in order to get access to them.</p>
      </div>
    )}
    </>
  )
}
