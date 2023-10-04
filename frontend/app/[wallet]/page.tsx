'use client';
import { Flex } from '@/components/flex';
import { useBuilderFIData } from '@/hooks/useBuilderFiApi';
import { useSocialData } from '@/hooks/useSocialData';
import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useMemo, useState } from 'react';
import { ChatTab } from './components/chat-tab';
import { HoldersTab } from './components/holders-tab';
import { HoldingTab } from './components/holding-tab';
import { Overview } from './components/overview';

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
	const socialData = useSocialData(params.wallet);
	const [selectedTab, setSelectedTab] = useState('chat');

	const { data: graphContext } = useBuilderFIData();

	const [holders, holdings] = useMemo(() => {
		const viewedUser = graphContext?.shareParticipants.find(user => user.owner == socialData.address.toLowerCase());
		return [viewedUser?.numberOfHolders || 0, viewedUser?.numberOfHoldings || 0];
	}, [graphContext?.shareParticipants, socialData.address]);

	return (
		<Flex component={'main'} y grow gap2 sx={{ p: { sm: 0, md: 2 } }}>
			<Overview socialData={socialData} />
			<Tabs value={selectedTab} onChange={(_, val) => val && setSelectedTab(val as string)} sx={{ flexGrow: 1 }}>
				<TabList tabFlex={1} className="grid w-full grid-cols-3">
					<Tab disableIndicator value="chat">
						Chat
					</Tab>
					<Tab disableIndicator value="holding">
						Holding ({holdings})
					</Tab>
					<Tab disableIndicator value="holders">
						Holders ({holders})
					</Tab>
				</TabList>
				<TabPanel value="chat" sx={{ display: selectedTab === 'chat' ? 'flex' : 'none', flexGrow: 1 }}>
					<ChatTab socialData={socialData} />
				</TabPanel>
				<TabPanel value="holding">
					<HoldingTab wallet={params.wallet} />
				</TabPanel>
				<TabPanel value="holders">
					<HoldersTab wallet={params.wallet} />
				</TabPanel>
			</Tabs>
		</Flex>
	);
}
