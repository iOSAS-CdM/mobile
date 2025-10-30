import React from 'react';
import { RefreshControl } from 'react-native-gesture-handler';

import { Flex, View } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';
import ContentPage from '../../../components/ContentPage';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import { API_Route } from '../../../main';

import theme from '../../../styles/theme';
const Home = () => {
	const greeting = React.useMemo(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'morning';
		else if (hour >= 12 && hour < 18) return 'afternoon';
		else return 'evening';
	}, []);

	const { cache } = useCache();
	const { setRefresh } = useRefresh();

	const header = (
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
	);

	return (
		<ContentPage
			header={header}
			fetchUrl={`${API_Route}/announcements`}
			cacheKey='announcements'
			transformItem={items => items.announcements || []}
			limit={10}
			contentGap={theme.v_spacing_sm}
			contentPadding={0}
			renderItem={(announcement) => <Announcement key={announcement.id} announcement={announcement} />}
			refreshControl={(
				<RefreshControl
					refreshing={false}
					onRefresh={() => {
						setRefresh({
							key: 'announcements',
							seeds: Date.now()
						});
					}}
				/>
			)}
		/>
	);
};

/**
 * @type {React.FC<{announcement: import('../../../classes/Announcement').AnnouncementProps}>}
 */
const Announcement = ({ announcement }) => {
	return (
		<>
			<View
				style={{
					padding: 16,
					borderBottomColor: theme.border_color_base,
					borderBottomWidth: theme.border_width_sm,
					backgroundColor: theme.fill_base
				}}
			>
				<Title level={4}>
					{announcement.title}
				</Title>
				<Flex>
					<Markdown>
						{announcement.content.split('\n')[0]}
					</Markdown>
				</Flex>
				<Flex direction='row' justify='between' align='center'>
					<Flex direction='row' align='center' gap={8}>
						<Avatar
							size='small'
							uri={announcement.author.profilePicture}
						/>
						<Text>
							{announcement.author.name.first} {announcement.author.name.last}
						</Text>
					</Flex>
					<Text>
						{new Date(announcement.created_at).toLocaleDateString()}
					</Text>
				</Flex>
			</View>
			<View
				style={{
					padding: 16,
					borderBottomColor: theme.border_color_base,
					borderBottomWidth: theme.border_width_sm,
					backgroundColor: theme.fill_base
				}}
			>
				<Title level={4}>
					{announcement.title}
				</Title>
				<Flex>
					<Markdown>
						{announcement.content.split('\n')[0]}
					</Markdown>
				</Flex>
				<Flex direction='row' justify='between' align='center'>
					<Flex direction='row' align='center' gap={8}>
						<Avatar
							size='small'
							uri={announcement.author.profilePicture}
						/>
						<Text>
							{announcement.author.name.first} {announcement.author.name.last}
						</Text>
				</Flex>
					<Text>
						{new Date(announcement.created_at).toLocaleDateString()}
					</Text>
			</Flex>
			</View>
		</>
	);
};

export default Home;
