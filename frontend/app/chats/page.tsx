'use client';
import { useEffect, useState, useContext } from 'react';
import { Icons } from '@/components/ui/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { GraphContext } from '@/lib/context';
import { UserItem } from '@/components/user-item';
import { formatUnits } from 'viem';

export default function ChatsPage() {
	const { address } = useAccount();
	const [holding, setHolding] = useState<any>([]);
	const [portfolio, setPortfolioValue] = useState(0);
	const [tradingFees, setTradingFees] = useState(0);
	const [loading, setLoading] = useState(true);
	const graphContext = useContext(GraphContext);

	useEffect(() => {
		//@ts-ignore
		if (!graphContext.graphData) return;

		//@ts-ignore
		const allHolders = graphContext.graphData.shareRelationships.filter((item: any) => {
			return item.holder.id == address?.toLowerCase() && item.heldKeyNumber > 0;
		});

		let value = 0;

		allHolders.forEach((item: any) => {
			value += parseFloat(item.owner.buyPrice);
		});
		setPortfolioValue(value);

		setHolding(allHolders.map((item: any) => item.owner));
		setLoading(false);

		//@ts-ignore
	}, [graphContext.graphData, address]);

	useEffect(() => {
		//@ts-ignore
		if (!graphContext.graphData) return;

		//@ts-ignore
		const viewedUser = graphContext.graphData.shareParticipants.find((user) => user.owner == address?.toLowerCase());

		if (viewedUser) {
			setTradingFees(viewedUser.tradingFeesAmount);
		}

		//@ts-ignore
	}, [graphContext.graphData, address]);

	// @ts-ignore
	const tradingFeesValue = () => formatUnits(tradingFees, 18);

	// @ts-ignore
	const portfolioValue = () => formatUnits(portfolio.toString(), 18);

	if (loading) {
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
			{holding.map((item: any) => (
				<UserItem item={item} key={`home-${item.owner}`} />
			))}
		</main>
	);
}
