'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { builderFIV1Abi } from '@/lib/abi/BuidlerFiV1';
import { MUMBAI_ADDRESS } from '@/lib/address';
import { useContractRead } from 'wagmi';
import { ChatTab } from './components/chat-tab';
import { HoldersTab } from './components/holders-tab';
import { HoldingTab } from './components/holding-tab';
import { Overview } from './components/overview';

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
	const { data: totalSupply } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'sharesSupply',
		args: [params.wallet],
	});

	const { data: buyPrice } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'getBuyPrice',
		args: [params.wallet],
	});

	const { data: buyPriceAfterFee } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'getBuyPriceAfterFee',
		args: [params.wallet],
	});

	const { data: sellPrice } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'getSellPrice',
		args: [params.wallet, BigInt(1)],
	});

	return (
		<main className="py-4 px-2">
			<Overview
				wallet={params.wallet}
				buyPrice={buyPrice}
				totalSupply={totalSupply}
				buyPriceAfterFee={buyPriceAfterFee}
				sellPrice={sellPrice}
			/>
			<Tabs defaultValue="chat" className="space-y-4 mt-4 pb-16">
				<TabsList className="grid w-full grid-cols-3 mb-8">
					<TabsTrigger value="chat">Chat</TabsTrigger>
					<TabsTrigger value="holding">Holding</TabsTrigger>
					<TabsTrigger value="holders">Holders</TabsTrigger>
				</TabsList>
				<TabsContent value="chat" className="space-y-4">
					<ChatTab wallet={params.wallet} />
				</TabsContent>
				<TabsContent value="holding" className="space-y-4">
					<HoldingTab wallet={params.wallet} />
				</TabsContent>
				<TabsContent value="holders" className="space-y-4">
					<HoldersTab wallet={params.wallet} />
				</TabsContent>
			</Tabs>
		</main>
	);
}
