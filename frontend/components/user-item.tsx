'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_PROFILE_PICTURE } from '@/lib/mock';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { formatUnits } from 'viem';

export function UserItem({ item }: any) {
	const { data: ensName } = useEnsName({
		address: item.owner,
	});
	const { data: ensAvatar } = useEnsAvatar({
		name: ensName,
	});

	const router = useRouter();

	const builderName = (item: { owner: string }) => {
		if (!item.owner) return 'Buidler';
		if (!ensName) return item.owner.slice(0, 9) + '...' + item.owner.slice(-5);
		return ensName;
	};

	const price = (item: any) => formatUnits(item.buyPrice || 0, 18);

	return (
		<div
			className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
			onClick={() => router.push(`/${item.owner}`)}
		>
			<div className="space-x-4 flex items-center">
				<Avatar className="mt-px h-5 w-5">
					<AvatarImage src={ensAvatar || DEFAULT_PROFILE_PICTURE} />
					<AvatarFallback>OM</AvatarFallback>
				</Avatar>
				<div className="space-y-1">
					<p className="text-sm font-medium leading-none">{builderName(item)}</p>
					<p className="text-sm text-muted-foreground">
						{item.numberOfHolders} holders | Price {price(item)} MATIC
					</p>
				</div>
			</div>
			<Button variant="ghost" size="icon" onClick={() => router.push(`/${item.owner}`)}>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
