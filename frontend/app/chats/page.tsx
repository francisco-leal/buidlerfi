'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { UserItem } from '@/components/user-item';
import { useBuilderFIData } from '@/hooks/useBuilderFiApi';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export default function ChatsPage() {
	const { address } = useAccount();
	const { data: graphContext, isLoading } = useBuilderFIData();

	const [portfolio, holding, tradingFees] = useMemo(() => {
		const allHolders =
			graphContext?.shareRelationships.filter((item) => {
				return item.holder.id == address?.toLowerCase() && item.heldKeyNumber > 0;
			}) || [];

		return [
			allHolders.reduce((prev, curr) => prev + curr.owner.buyPrice, BigInt(0)),
			allHolders.map((item) => item.owner),
			graphContext?.shareParticipants.find((user) => user.owner == address?.toLowerCase())?.tradingFeesAmount,
		];
	}, [address, graphContext]);

	const tradingFeesValue = () => (!tradingFees ? 'undefined' : formatUnits(tradingFees, 18));

	const portfolioValue = () => formatUnits(BigInt(portfolio), 18);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center w-full mt-24">
				<Icons.spinner className="h-4 w-4 animate-spin" />
			</div>
		);
	}

	return (
		<main className="pt-4 px-2 pb-16">
			<div className="grid gap-4 grid-cols-2 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold">{portfolioValue()} MATIC</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Trading fees</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold">{tradingFeesValue()} MATIC</div>
					</CardContent>
				</Card>
			</div>
			{holding.map((item) => (
				<UserItem
					address={item.owner}
					buyPrice={item.buyPrice}
					numberOfHolders={item.numberOfHolders}
					key={`home-${item.owner}`}
				/>
			))}
		</main>
	);
}
