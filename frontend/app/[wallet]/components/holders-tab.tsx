'use client';
import { useEffect, useState, useContext } from 'react';
import { Icons } from '@/components/ui/icons';
import { GraphContext } from '@/lib/context';
import { UserItem } from '@/components/user-item';

export function HoldersTab({ wallet }: { wallet: string }) {
	const [holders, setHolders] = useState<any>([]);
	const [loading, setLoading] = useState(true);
	const graphContext = useContext(GraphContext);

	useEffect(() => {
		//@ts-ignore
		if (!graphContext.graphData) return;

		//@ts-ignore
		const allHolders = graphContext.graphData.shareRelationships.filter((item: any) => {
			return item.owner.id == wallet?.toLowerCase() && item.heldKeyNumber > 0;
		});

		setHolders(allHolders.map((item: any) => item.holder));
		setLoading(false);

		//@ts-ignore
	}, [graphContext.graphData, wallet]);

	if (loading) {
		return (
			<div className="flex items-center justify-center w-full mt-24">
				<Icons.spinner className="h-4 w-4 animate-spin" />
			</div>
		);
	}

	return (
		<>
			{holders.map((item: any) => (
				<UserItem item={item} key={`home-${item.owner}`} />
			))}
		</>
	);
}
