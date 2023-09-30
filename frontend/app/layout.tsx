'use client';

import { Inter } from 'next/font/google';
import './globals.css';

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { lineaTestnet, polygon, polygonMumbai } from 'wagmi/chains';

import { BottomNav } from '@/components/bottom-nav';
import { NavBalance } from '@/components/nav-balance';
import { NavWeb3Button } from '@/components/nav-web3-button';
import { Toaster } from '@/components/ui/toaster';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraphContext } from '@/lib/context';
import { fetchTheGraphData } from '@/lib/graphql';
import { LOGO } from '@/lib/mock';
import { useEffect, useState } from 'react';

const chains = [polygonMumbai, lineaTestnet, polygon];
const projectId = '530148d9ddb07d128a40fc21cc9ffdd9';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
	autoConnect: true,
	connectors: w3mConnectors({ projectId, chains }),
	publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [refreshGraph, setRefreshGraph] = useState(true);
	const [graphData, setGraphData] = useState({ data: null });

	useEffect(() => {
		if (!refreshGraph) return;

		fetchTheGraphData().then((data) => setGraphData(data));
	}, [refreshGraph]);

	return (
		<html lang="en" suppressHydrationWarning className="h-full">
			<body className={inter.className + ' relative h-full'}>
				<WagmiConfig config={wagmiConfig}>
					<GraphContext.Provider value={{ graphData: graphData?.data, forceRefresh: () => setRefreshGraph(true) }}>
						<div className="h-full flex-col pt-16">
							<div className="flex items-center justify-between w-full py-4 h-16 px-4 fixed top-0 left-0 border-b bg-white z-10">
								<Avatar className="h-28 w-28">
									<AvatarImage src={LOGO} />
									<AvatarFallback>LOGO</AvatarFallback>
								</Avatar>
								<div className="ml-auto flex items-center w-full space-x-2 justify-end">
									<NavBalance />
									<NavWeb3Button />
								</div>
							</div>
							{children}
							<BottomNav />
						</div>
					</GraphContext.Provider>
				</WagmiConfig>
				<Toaster />
				<Web3Modal
					projectId={projectId}
					ethereumClient={ethereumClient}
					themeVariables={{
						'--w3m-accent-color': '#000',
					}}
				/>
			</body>
		</html>
	);
}
