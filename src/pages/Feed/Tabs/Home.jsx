import React from 'react';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import { Flex } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';

import { useCache } from '../../../contexts/CacheContext';
import { RefreshContext } from '../Feed';

import theme from '../../../styles/theme';
const Home = () => {
	const greeting = React.useMemo(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'morning';
		else if (hour >= 12 && hour < 18) return 'afternoon';
		else return 'evening';
	}, []);

	const { cache, updateCache, getCache } = useCache();
	const { setRefresh } = React.useContext(RefreshContext);

	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={false}
					onRefresh={async () => {
						setRefresh('user');
					}}
					colors={[theme.brand_primary]}
					tintColor={theme.brand_primary}
				/>
			}
		>
			<Flex
				direction='column'
				justify='flex-start'
				align='stretch'
			>
				{/***************************************** Greeting *****************************************/}
				<Flex
					direction='column'
					justify='flex-start'
					align='stretch'
					style={{ padding: 16, backgroundColor: theme.fill_base }}
				>
					<Text>{greeting ? `Good ${greeting},` : 'Hello,'}</Text>
					<Flex direction='row' align='center' gap={8}>
						<Avatar
							size='large'
							uri={cache.user?.profilePicture}
						/>
						<Title level={2}>
							{cache.user?.name?.first || ''}
						</Title>
					</Flex>
				</Flex>
			</Flex>
		</ScrollView>
	);
};

export default Home;
