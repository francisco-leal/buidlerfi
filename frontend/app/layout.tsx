'use client'

import './globals.css'
import { Inter } from 'next/font/google'

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'

import { NavWeb3Button } from "@/components/nav-web3-button"
import { Toaster } from "@/components/ui/toaster"
import { BottomNav } from "@/components/bottom-nav"
import { NavBalance } from '@/components/nav-balance'

const chains = [polygonMumbai]
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
    <html lang="en" suppressHydrationWarning className='h-full'>
      <body className={inter.className + " relative h-full"}>
        <WagmiConfig config={wagmiConfig}>
        <div className="h-full flex-col pt-16">
          <div className="container flex items-center justify-between py-4 h-16 px-4 fixed top-0 left-0 border-b bg-white z-10">
            <h2 className="text-lg font-semibold">BuidlerFi</h2>
            <div className="ml-auto flex items-center w-full space-x-2 justify-end">
              <NavBalance />
              <NavWeb3Button />
            </div>
          </div>
          {children}
          <BottomNav />
        </div>
        </WagmiConfig>
        <Toaster />
        <Web3Modal
          projectId={projectId}
          ethereumClient={ethereumClient}
          themeVariables={{
            '--w3m-accent-color': '#000'
          }}
        />
      </body>
    </html>
  )
}
