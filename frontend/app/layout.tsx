'use client'

import './globals.css'
import { Inter } from 'next/font/google'

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'

import { Separator } from "@/components/ui/separator"

import { NavActions } from "@/components/nav-actions"
import { NavWeb3Button } from "@/components/nav-web3-button"

const chains = [arbitrum, mainnet, polygon]
const projectId = '530148d9ddb07d128a40fc21cc9ffdd9'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
        <div className="h-full flex-col">
          <div className="container flex items-center justify-between py-4 h-16">
            <h2 className="text-lg font-semibold">BuidlerFi</h2>
            <div className="ml-auto flex w-full space-x-2 justify-end">
              <NavWeb3Button />
              <NavActions />
            </div>
          </div>
          <Separator />
          {children}
        </div>
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </body>
    </html>
  )
}
