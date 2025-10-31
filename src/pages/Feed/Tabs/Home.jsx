import React from 'react';
import { Image, Pressable } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import { Flex } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';
import ContentPage from '../../../components/ContentPage';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import { API_Route, navigationRef } from '../../../main';

import theme from '../../../styles/theme';
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

	const [likers, setLikers] = React.useState([]);

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

	const bottomSheetRef = React.useRef(null);
	const handleSheetChanges = React.useCallback((index) => {
		console.log('handleSheetChanges', index);
	}, []);
	const viewLikers = (announcement) => {
		setLikers(announcement.likes || []);
		bottomSheetRef.current?.snapToIndex(1);
	};
	const viewComments = (announcement) => { };

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
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
						viewLikers={() => viewLikers(announcement)}
						viewComments={() => viewComments(announcement)}
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

			<BottomSheet
				ref={bottomSheetRef}
				onChange={handleSheetChanges}
				enablePanDownToClose={true}
				index={-1}
				snapPoints={['25%', '50%']}
			>
				<BottomSheetView style={{ padding: 16 }}>
					<Title level={4} style={{ marginBottom: 16 }}>Likers</Title>
					{likers.length === 0 ? (
						<Text>No likes yet</Text>
					) : (
						likers.map((like) => (
							<Flex key={like.author.id} direction='row' align='center' gap={8} style={{ marginBottom: 8 }}>
								<Avatar size='small' uri={like.author.profilePicture} />
								<Text>{like.author.name.first} {like.author.name.last}</Text>
							</Flex>
						))
					)}
				</BottomSheetView>
			</BottomSheet>
		</GestureHandlerRootView>
	);
};

/**
 * @type {React.FC<{
 * 	announcement: import('../../../classes/Announcement').AnnouncementProps,
 * 	viewLikers?: () => void
 * 	viewComments?: () => void
 * }>}
 */
const Announcement = ({
	announcement: rawAnnouncement,
	viewLikers,
	viewComments
}) => {
	const { cache } = useCache();
	const [announcement, setAnnouncement] = React.useState(rawAnnouncement);

	const like = async () => {
		if (!cache.user) return;
		setAnnouncement((prev) => {
			const hasLiked = prev.likes?.find(
				(like) => like.author.id === cache.user?.id
			);
			let updatedLikes;
			if (hasLiked) {
				// Unlike
				updatedLikes = prev.likes.filter(
					(like) => like.author.id !== cache.user?.id
				);
			} else {
				// Like
				updatedLikes = [
					...(prev.likes || []),
					{ author: cache.user, date: new Date() }
				];
			}
			return {
				...prev,
				likes: updatedLikes
			};
		});

		const response = await authFetch(
			`${API_Route}/announcements/${rawAnnouncement.id}/like`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({})
			}
		);
		if (response?.status === 0) return;

		const data = await response.json();
		if (!data) return;
	};

	return (
		<Pressable
			android_ripple={{ color: theme.fill_mask }}
			onLongPress={viewLikers}
		>
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
				<Flex
					direction='column'
					justify='flex-start'
					align='stretch'
					style={{
						paddingHorizontal: theme.h_spacing_md,
						paddingTop: theme.v_spacing_md
					}}
				>
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
				<Flex
					direction='row'
					justify='between'
					align='center'
					style={{ paddingHorizontal: theme.h_spacing_md }}
				>
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
					<Pressable
						onPress={like}
						android_ripple={{
							color: theme.fill_mask,
							borderless: false
						}}
						style={{
							flex: 1,
							backgroundColor: 'transparent',
							paddingHorizontal: theme.h_spacing_md,
							paddingVertical: theme.v_spacing_sm
						}}
						onLongPress={viewLikers}
					>
						<Flex
							direction='row'
							justify='start'
							align='center'
							gap={8}
						>
							<Ionicons
								name={
									announcement.likes?.find(
										(like) => like.author.id === cache.user?.id
									)
										? 'heart'
										: 'heart-outline'
								}
								color={
									announcement.likes?.find(
										(like) => like.author.id === cache.user?.id
									)
										? theme.brand_primary
										: theme.text_color_base
								}
							/>
							<Text>
								{announcement.likes?.length} like
								{announcement.likes?.length !== 1 && 's'}
							</Text>
						</Flex>
					</Pressable>
					<Pressable
						android_ripple={{
							color: theme.fill_mask,
							borderless: false
						}}
						style={{
							flex: 1,
							backgroundColor: 'transparent',
							paddingHorizontal: theme.h_spacing_md,
							paddingVertical: theme.v_spacing_sm
						}}
						onPress={viewComments}
					>
						<Flex
							direction='row'
							justify='center'
							align='center'
							gap={8}
						>
							<Ionicons name='chatbubble-outline' />
							<Text>
								{announcement.comments?.length} comment
								{announcement.comments?.length !== 1 && 's'}
							</Text>
						</Flex>
					</Pressable>
					<Pressable
						android_ripple={{
							color: theme.fill_mask,
							borderless: false
						}}
						style={{
							flex: 1,
							backgroundColor: 'transparent',
							paddingHorizontal: theme.h_spacing_md,
							paddingVertical: theme.v_spacing_sm
						}}
						onPress={() => navigationRef.current?.navigate('ViewAnnouncement', { announcement, setAnnouncement })}
					>
						<Flex
							direction='row'
							justify='end'
							align='center'
							gap={8}
						>
							<Text>
								Read More
							</Text>
							<Ionicons name='chevron-forward-outline' />
						</Flex>
					</Pressable>
				</Flex>
			</Flex>
		</Pressable>
	);
};

export default Home;
