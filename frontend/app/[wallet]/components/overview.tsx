'use client';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { useBuilderFIData } from '@/hooks/useBuilderFiApi';
import { useSocialData } from '@/hooks/useSocialData';
import { builderFIV1Abi } from '@/lib/abi/BuidlerFiV1';
import { MUMBAI_ADDRESS } from '@/lib/address';
import { FARCASTER_LOGO, LENS_LOGO } from '@/lib/assets';
import { shortAddress } from '@/lib/utils';
import { Avatar, Chip, Tooltip } from '@mui/joy';
import { FC, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

interface Props {
	wallet: `0x${string}`;
	buyPrice?: bigint;
	totalSupply?: bigint;
	buyPriceAfterFee?: bigint;
	sellPrice?: bigint;
}

export const Overview: FC<Props> = ({ wallet, buyPrice, totalSupply, buyPriceAfterFee, sellPrice }) => {
	const { address } = useAccount();
	const [buyingKeys, setBuyingKeys] = useState(false);
	const [sellingKeys, setSellingKeys] = useState(false);
	const [openBuy, setOpenBuy] = useState(false);
	const { toast } = useToast();

	const { data: graphContext } = useBuilderFIData();

	const [holders, holdings] = useMemo(() => {
		const viewedUser = graphContext?.shareParticipants.find((user) => user.owner == wallet.toLowerCase());
		return [viewedUser?.numberOfHolders || 0, viewedUser?.numberOfHoldings || 0];
	}, [graphContext?.shareParticipants, wallet]);

	const socialData = useSocialData(wallet);

	const { data: supporterKeys } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'sharesBalance',
		args: [wallet, address!],
		enabled: !!address,
	});

	const { data: supporterNumber } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'supporterNumber',
		args: [wallet, address!],
		enabled: !!address,
	});

	const { data: tx_buy, write: contractBuyKeys } = useContractWrite({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'buyShares',
		onSuccess: () => {
			setOpenBuy(false);
			setBuyingKeys(false);
			toast({
				title: 'Transaction submitted!',
				description: `Hash: ${tx_buy}`,
			});
		},
		onError: () => {
			setOpenBuy(false);
			setBuyingKeys(false);
			toast({
				title: 'Unable to buy key',
				description: `There was an error processing your transaction`,
			});
		},
	});

	const {} = useWaitForTransaction({
		hash: tx_buy?.hash,
		onSuccess: () => {
			toast({
				title: 'Key bought!',
				description: `You bought a key of ${socialData.name}.`,
			});
			window.location.reload();
		},
	});

	const { data: tx_sell, write: contractSellKeys } = useContractWrite({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'sellShares',
		onSuccess: () => {
			setOpenBuy(false);
			setSellingKeys(false);
			toast({
				title: 'Transaction submitted!',
				description: `Hash: ${tx_sell?.hash}`,
			});
		},
		onError: () => {
			setOpenBuy(false);
			setSellingKeys(false);
			toast({
				title: 'Unable to sell key',
				description: `There was an error processing your transaction`,
			});
		},
	});

	const {} = useWaitForTransaction({
		hash: tx_sell?.hash,
		onSuccess: () => {
			toast({
				title: 'Key sold!',
				description: `You sold a key of ${socialData.name}.`,
			});
			window.location.reload();
		},
	});

	const buyKeys = async () => {
		setBuyingKeys(true);
		contractBuyKeys({ args: [wallet], value: buyPriceAfterFee });
	};

	const sellKeys = async () => {
		setSellingKeys(true);

		contractSellKeys({ args: [wallet, BigInt(1)] });
	};

	const calculateBuyPrice = () => {
		return `${formatUnits(buyPrice || BigInt(0), 18)}`;
	};

	const calculateSellPrice = () => {
		return `${formatUnits(sellPrice || BigInt(0), 18)}`;
	};

	const holderNumberText = () => {
		console.log({ totalSupply, supporterNumber, supporterKeys });
		if (totalSupply === undefined || supporterNumber === undefined || supporterKeys === undefined) return '...';

		if (totalSupply === BigInt(0) && address == wallet) {
			return 'Your first share is free.';
		}

		if (supporterNumber === BigInt(0) && supporterKeys > 0) {
			return 'You are holder #0';
		}
		if (supporterNumber && supporterNumber > 0) {
			return `You are holder #${supporterNumber}`;
		} else {
			return "You don't hold any key";
		}
	};

	const hasKeys = () => {
		return !!supporterKeys && supporterKeys > 0;
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<div className="flex flex-row space-x-3 items-center">
					<Avatar src={socialData.avatar} />
					<div className="flex flex-col">
						<h2 className="text-xl font-bold	 leading-none">{socialData.name}</h2>
						{!socialData.name.startsWith('0x') && (
							<p className="text-xs text-muted-foreground">{shortAddress(wallet)}</p>
						)}
					</div>
				</div>
				<div className="space-x-2">
					<AlertDialog open={openBuy} onOpenChange={() => setOpenBuy(true)}>
						<AlertDialogTrigger>
							<Button disabled={totalSupply === BigInt(0) && address != wallet}>{hasKeys() ? 'Trade' : 'Buy'}</Button>
						</AlertDialogTrigger>
						<AlertDialogContent className="w-11/12">
							<AlertDialogHeader>
								<AlertDialogTitle>{hasKeys() ? 'Trade' : 'Buy'} Keys</AlertDialogTitle>
								<div className="flex flex-col pt-8">
									<div className="flex items-center justify-between">
										<p className="font-medium leading-none">{socialData.name}</p>
										<p className="leading-none">{calculateBuyPrice() || '0'} MATIC</p>
									</div>
									<div className="flex items-center justify-between mt-2">
										<p className="text-sm text-muted-foreground">
											{hasKeys() ? `You own ${supporterKeys} keys` : "You don't own any keys"}
										</p>
										<p className="text-sm text-muted-foreground">Key price</p>
									</div>
									<Button onClick={() => buyKeys()} disabled={buyingKeys || sellingKeys} className="mt-4">
										{buyingKeys && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
										Buy a key
									</Button>
									{hasKeys() && (
										<>
											<Button
												variant="outline"
												onClick={() => sellKeys()}
												disabled={buyingKeys || sellingKeys}
												className="mt-2"
											>
												{sellingKeys && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
												Sell a key
											</Button>
											<div className="flex items-center justify-center mt-2">
												<p className="text-sm text-muted-foreground">Sell price: {calculateSellPrice()}</p>
											</div>
										</>
									)}
									<Button
										variant="ghost"
										onClick={() => setOpenBuy(false)}
										disabled={buyingKeys || sellingKeys}
										className="mt-2"
									>
										Cancel
									</Button>
								</div>
							</AlertDialogHeader>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
			<div className="flex items-center justify-between mt-4">
				<p className="text-base font-medium">{holderNumberText()}</p>
				<p className="text-base font-medium">{calculateBuyPrice()} MATIC</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<p className="text-sm text-muted-foreground">{holders} holders</p>
					<p className="text-sm text-muted-foreground">{holdings} holding</p>
				</div>
				<p className="text-sm text-muted-foreground">Key price</p>
			</div>
			{socialData.socialsList.length > 0 && (
				<div className="flex flex-wrap space-x-2 mt-2">
					{socialData.socialsList.map((social) => (
						<Tooltip key={social.dappName} title={social.dappName} placement="top">
							<Chip
								variant="outlined"
								color="neutral"
								size="lg"
								startDecorator={
									social.dappName === 'lens' ? (
										<Avatar size="md" src={LENS_LOGO} />
									) : (
										<Avatar sx={{ p: 0.4 }} size="md" src={FARCASTER_LOGO} />
									)
								}
							>
								{social.profileName}
							</Chip>
						</Tooltip>
					))}
				</div>
			)}
		</>
	);
};
