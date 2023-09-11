'use client'
import { useEffect, useState, useContext } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { getEnsName } from 'viem/ens';
import { isAddress, formatUnits } from 'viem';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Icons } from '@/components/ui/icons'
import { useToast } from "@/components/ui/use-toast"
import { useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi'
import abi from "@/lib/abi/BuidlerFiV1.json";
import { MUMBAI_ADDRESS } from '@/lib/address';
import { GraphContext } from '@/lib/context';

export function Overview({
  wallet,
  buyPrice,
  totalSupply,
  buyPriceAfterFee,
  sellPrice
}: {
  wallet: string,
  buyPrice: unknown,
  totalSupply: unknown,
  buyPriceAfterFee: unknown,
  sellPrice: unknown
}) {
  const publicClient = usePublicClient()
  const { address, isConnecting, isDisconnected } = useAccount()
  const [ensName, setENSName] = useState("");
  const [holders, setHolders] = useState(0);
  const [holdings, setHoldings] = useState(0);
  const [buyingKeys, setBuyingKeys] = useState(false);
  const [sellingKeys, setSellingKeys] = useState(false);
  const [openBuy, setOpenBuy] = useState(false);
  const { toast } = useToast()
  const graphContext = useContext(GraphContext)

  useEffect(() => {
    //@ts-ignore
    if (!graphContext.graphData) return;

    //@ts-ignore
    const viewedUser = graphContext.graphData.shareParticipants.find((user) => user.owner == wallet.toLowerCase());

    if(viewedUser) {
      setHolders(viewedUser.numberOfHolders);
      setHoldings(viewedUser.numberOfHoldings);
    }

    //@ts-ignore
  }, [graphContext.graphData])

  const { data: supporterKeys } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'sharesBalance',
    args: [wallet, address]
  });

  const { data: supporterNumber } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'supporterNumber',
    args: [wallet, address]
  });

  const { data: tx_buy, write: contractBuyKeys } = useContractWrite({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'buyShares',
    onSuccess: () => {
      setOpenBuy(false)
      setBuyingKeys(false)
      toast({
        title: "Transaction submitted!",
        description: `Hash: ${tx_buy}`,
      })
    },
    onError: () => {
      setOpenBuy(false)
      setBuyingKeys(false)
      toast({
        title: "Unable to buy key",
        description: `There was an error processing your transaction`,
      })
    }
  })

  const { data: tx_data_buy } = useWaitForTransaction({
    hash: tx_buy?.hash,
    onSuccess: () => {
      toast({
        title: "Key bought!",
        description: `You bought a key of ${builderName()}.`,
      })
    },
  })

  const { data: tx_sell, write: contractSellKeys } = useContractWrite({
    address: MUMBAI_ADDRESS,
    abi: abi,
    functionName: 'sellShares',
    onSuccess: () => {
      setOpenBuy(false)
      setSellingKeys(false)
      toast({
        title: "Transaction submitted!",
        description: `Hash: ${tx_sell?.hash}`,
      })
    },
    onError: () => {
      setOpenBuy(false)
      setSellingKeys(false)
      toast({
        title: "Unable to sell key",
        description: `There was an error processing your transaction`,
      })
    }
  })

  const { data: tx_data_sell } = useWaitForTransaction({
    hash: tx_sell?.hash,
    onSuccess: () => {
      toast({
        title: "Key sold!",
        description: `You sold a key of ${builderName()}.`,
      })
    },
  })

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
    // @ts-ignore
    contractBuyKeys({args: [wallet], from: address, value: buyPriceAfterFee})
  }

  const sellKeys = async () => {
    setSellingKeys(true)

    // @ts-ignore
    contractSellKeys({args: [wallet, 1], from: address})
  }

  const calculateBuyPrice = () => {
    //@ts-ignore
    return `${formatUnits(buyPrice || 0, 18)}`
  }

  const calculateSellPrice = () => {
    //@ts-ignore
    return `${formatUnits(sellPrice || 0, 18)}`
  }

  const holderNumberText = () => {
    if (totalSupply == 0 && (address == wallet)) {
      return "Your first share is free."
    }

    // @ts-ignore
    if (supporterNumber == 0 && supporterKeys > 0) {
      return 'You are holder #0';
    }
    // @ts-ignore
    if (supporterNumber > 0) {
      return `You are holder #${supporterNumber}`;
    } else {
      return "You don't hold any key";
    }
  }

  const hasKeys = () => {
    // @ts-ignore
    return supporterKeys > 0
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
            <Button disabled={(totalSupply == 0 && (address != wallet))}>{hasKeys() ? "Trade" : "Buy"}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='w-11/12'>
            <AlertDialogHeader>
              <AlertDialogTitle>{hasKeys() ? "Trade":"Buy"} Keys</AlertDialogTitle>
              <div className="flex flex-col pt-8">
                <div className="flex items-center justify-between">
                  <p className="font-medium leading-none">{builderName()}</p>
                  <p className="leading-none">{calculateBuyPrice() || "0"} MATIC</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">{hasKeys() ? `You own ${supporterKeys} keys` : "You don't own any keys"}</p>
                  <p className="text-sm text-muted-foreground">Key price</p>
                </div>
                <Button onClick={() => buyKeys()} disabled={buyingKeys || sellingKeys} className='mt-4'>
                  {buyingKeys && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Buy a key
                </Button>
                {
                  hasKeys() && (<>
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
      <p className="text-base font-medium">{calculateBuyPrice()} MATIC</p>
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
