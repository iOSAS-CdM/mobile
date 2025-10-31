import React from 'react';
import { Image, Pressable } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Flex } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';
import ContentPage from '../../../components/ContentPage';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import { API_Route } from '../../../main';

import theme from '../../../styles/theme';
import IconButton from '../../../components/IconButton';
import authFetch from '../../../utils/authFetch';
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
				<Avatar size='large' uri={cache.user?.profilePicture} />
				<Title level={2}>{cache.user?.name?.first || ''}</Title>
			</Flex>
		</Flex>
	);

	return (
		<ContentPage
			header={header}
			fetchUrl={`${API_Route}/announcements`}
			cacheKey='announcements'
			transformItem={(items) => items.announcements || []}
			limit={10}
			contentGap={theme.v_spacing_sm}
			contentPadding={0}
			renderItem={(announcement) => (
				<Announcement
					key={announcement.id}
					announcement={announcement}
				/>
			)}
			refreshControl={
				<RefreshControl
					refreshing={false}
					onRefresh={() => {
						setRefresh({
							key: 'announcements',
							seeds: Date.now()
						});
					}}
				/>
			}
		/>
	);
};

/**
 * @type {React.FC<{announcement: import('../../../classes/Announcement').AnnouncementProps}>}
 */
const Announcement = ({ announcement }) => {
	const [liked, setLiked] = React.useState(false);

	const { cache } = useCache();

	const like = async () => {
		if (!cache.user) return;
		setLiked(!liked);

		const response = await authFetch(`${API_Route}/announcements/${announcement.id}/like`, {
			method: liked ? 'DELETE' : 'POST',
			signal: new AbortController().signal
		});
		if (response?.status === 0) return;
		if (!response?.ok) return;
	};

	return (
		<Pressable android_ripple={{ color: theme.fill_mask }}>
			<Flex
				direction='column'
				justify='flex-start'
				align='stretch'
				style={{
					gap: theme.v_spacing_lg,
					borderBottomColor: theme.border_color_base,
					borderBottomWidth: theme.border_width_sm,
					backgroundColor: theme.fill_base
				}}
			>
				<Flex direction='column' justify='flex-start' align='stretch' style={{ paddingHorizontal: theme.h_spacing_md, paddingTop: theme.v_spacing_md }}>
					<Title level={4}>{announcement.title}</Title>
					<Markdown>{announcement.content.split('\n')[0]}</Markdown>
				</Flex>
				<Image
					source={{ uri: announcement.cover }}
					style={{
						width: '100%',
						height: 128,
						borderRadius: 8
					}}
					resizeMode='cover'
				/>
				<Flex direction='row' justify='between' align='center' style={{ paddingHorizontal: theme.h_spacing_md }}>
					<Flex direction='row' align='center' gap={8}>
						<Avatar
							size='small'
							uri={announcement.author.profilePicture}
						/>
						<Text>
							{announcement.author.name.first}{' '}
							{announcement.author.name.last}
						</Text>
					</Flex>
					<Text>
						{new Date(announcement.created_at).toLocaleDateString()}
					</Text>
				</Flex>
				<Flex direction='row' justify='between' align='center' gap={16}>
					<Pressable onPress={like} android_ripple={{ color: theme.fill_mask, borderless: true }} style={{ backgroundColor: 'transparent', paddingHorizontal: theme.h_spacing_md, paddingBottom: theme.v_spacing_sm }}>
						<Flex direction='row' justify='center' align='center' gap={8}>
							<Ionicons name={liked ? 'heart' : 'heart-outline'} />
							<Text>{liked ? announcement.likes?.length + 1 : announcement.likes?.length} like{announcement.likes?.length !== 1 && 's'}</Text>
						</Flex>
					</Pressable>
					<Pressable android_ripple={{ color: theme.fill_mask, borderless: true }} style={{ backgroundColor: 'transparent', paddingHorizontal: theme.h_spacing_md, paddingVertical: theme.v_spacing_sm }}>
						<Flex direction='row' justify='center' align='center' gap={8}>
							<Ionicons name='chatbubble-outline' />
							<Text>{announcement.comments?.length} comment{announcement.comments?.length !== 1 && 's'}</Text>
						</Flex>
					</Pressable>
				</Flex>
			</Flex>
		</Pressable>
	);
};

export default Home;
