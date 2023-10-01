'use client';
import { Button } from '@/components/ui/button';
import { useSocialData } from '@/hooks/useSocialData';
import Avatar from '@mui/joy/Avatar';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';

interface Props {
	address: `0x${string}`;
	numberOfHolders: number;
	buyPrice: bigint;
}

export function UserItem({ address, numberOfHolders, buyPrice }: Props) {
	const router = useRouter();

	const socialData = useSocialData(address);

	return (
		<div
			className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
			onClick={() => router.push(`/${address}`)}
		>
			<div className="space-x-4 flex items-center">
				<Avatar size="sm" src={socialData.avatar} />
				<div className="space-y-1">
					<p className="text-sm font-medium leading-none">{socialData.name}</p>
					<p className="text-sm text-muted-foreground">
						{numberOfHolders.toString()} holders | Price {formatUnits(BigInt(buyPrice || 0), 18)} MATIC
					</p>
				</div>
			</div>
			<Button variant="ghost" size="icon" onClick={() => router.push(`/${address}`)}>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
