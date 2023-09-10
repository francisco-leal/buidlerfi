'use client'
import { useAccount, useEnsName } from 'wagmi'

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data: ensName, isError, isLoading } = useEnsName({
    address,
  });

  const builderName = () => {
    if (!address) return ("Buidler");
    if (isError || isLoading || !ensName) return (address.slice(0, 5) + "..." + address.slice(-3));
    return ensName;
  }

  if (isConnecting) return <h1>Connecting...</h1>
  if (isDisconnected) return <h1>Please connect your wallet to proceed</h1>

  return (
    <main className="p-8">
      <h1>BuidlerFi</h1>
      <p>Welcome {builderName()}!</p>
    </main>
  )
}