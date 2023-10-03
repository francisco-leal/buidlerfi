'use client';
import { Button } from '@/components/ui/button';
import { builderFIV1Abi } from '@/lib/abi/BuidlerFiV1';
import { MUMBAI_ADDRESS } from '@/lib/address';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Lock, MessageSquare } from 'lucide-react';
import { isAddress } from 'viem';
import { getEnsName } from 'viem/ens';
import { useAccount, useContractRead, usePublicClient } from 'wagmi';

export function ChatTab({ wallet }: { wallet: `0x${string}` }) {
	const { address } = useAccount();
	const { data: supporterKeys } = useContractRead({
		address: MUMBAI_ADDRESS,
		abi: builderFIV1Abi,
		functionName: 'sharesBalance',
		args: [wallet, address!],
		enabled: !!address,
	});
	console.log(supporterKeys);

	//ENS must be resolved from mainnet
	const publicClient = usePublicClient({ chainId: 1 });

	const { data: ensName } = useQuery(['getEnsName', wallet], () => getEnsName(publicClient, { address: wallet }), {
		enabled: isAddress(wallet),
	});

	const sendQuestion = async (questionContent: string) => {
		const response = await axios.post('/api/questions', {
			questionContent,
			replierWallet: wallet,
			questionerWallet: address,
		});

		console.log(response.data);
	};

	// const sendReply = async (questionId: number, questionAnswer: string) => {
	// 	const response = await axios.put(`/api/questions/${questionId}`, {
	// 		questionAnswer,
	// 	});

	// 	console.log(response.data);
	// };

	const builderName = () => {
		if (!wallet) return 'Buidler';
		if (!ensName) return wallet.slice(0, 12) + '...' + wallet.slice(-10);
		return ensName;
	};

	if (supporterKeys === BigInt(0)) {
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
			<Button onClick={() => sendQuestion('Fake question')}>Send message</Button>
		</>
	);
}
