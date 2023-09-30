'use client';
import { Lock, MessageSquare } from 'lucide-react';
import { useContractRead, useAccount, usePublicClient } from 'wagmi';
import abi from '@/lib/abi/BuidlerFiV1.json';
import { MUMBAI_ADDRESS } from '@/lib/address';
import { useEffect, useState } from 'react';
import { getEnsName } from 'viem/ens';
import { isAddress } from 'viem';

export function ChatTab({ wallet }: { wallet: string }) {
	const { address, isConnecting, isDisconnected } = useAccount();
	const [ensName, setENSName] = useState('');
	const { data: supporterKeys } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: abi,
		functionName: 'sharesBalance',
		args: [wallet, address],
	});
	const publicClient = usePublicClient();

	useEffect(() => {
		if (wallet && isAddress(wallet as string)) {
			// @ts-ignore
			getEnsName(publicClient, { address: wallet }).then((name) => {
				if (name) {
					setENSName(name);
				}
			});
		}
	}, [wallet]);

	const builderName = () => {
		if (!wallet) return 'Buidler';
		if (!ensName) return wallet.slice(0, 12) + '...' + wallet.slice(-10);
		return ensName;
	};

	if (supporterKeys == 0) {
		return (
			<div className="flex flex-col items-center justify-center mt-24">
				<Lock className="text-muted-foreground h-32 w-32 mb-6" />
				<p>Hold atleast one key to access the chat.</p>
			</div>
		);
	}

	return (
		<>
			<div className="flex flex-col items-center justify-center mt-24">
				<MessageSquare className="text-muted-foreground h-32 w-32 mb-6" />
				<p className="text-center">Congratulations. You can now chat with {builderName()}</p>
			</div>
		</>
	);
}
