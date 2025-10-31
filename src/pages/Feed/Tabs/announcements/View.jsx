import React from 'react';

import { ScrollView, Image, Pressable } from 'react-native';
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

import { Flex } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';
import Ionicons from '@expo/vector-icons/Ionicons';

import Text from '../../../../components/Text';
import Title from '../../../../components/Title';
import Button from '../../../../components/Button';
import Avatar from '../../../../components/Avatar';

import { navigationRef, API_Route } from '../../../../main';
import { useCache } from '../../../../contexts/CacheContext';
import authFetch from '../../../../utils/authFetch';

import theme from '../../../../styles/theme';

/**
 * @type {React.FC<{
 * 	route: import('@react-navigation/native').RouteProp<any, 'ViewAnnouncement'>;
 * }>}
 */
const ViewAnnouncement = ({ route }) => {
	/** @type {import('../../../../classes/Announcement').AnnouncementProps | null} */
	const announcement = route.params?.announcement || null;
	const { cache } = useCache();
	const [currentAnnouncement, setCurrentAnnouncement] = React.useState(announcement);

	const like = async () => {
		if (!cache.user || !currentAnnouncement) return;
		setCurrentAnnouncement((prev) => {
			if (!prev) return prev;
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
			`${API_Route}/announcements/${currentAnnouncement.id}/like`,
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

	if (!announcement) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					padding: 16,
					backgroundColor: theme.fill_base
				}}
			>
				<Text style={{ fontSize: theme.font_size_heading, fontWeight: '600', marginBottom: 8 }}>
					No Announcement Data
				</Text>
				<Text style={{ fontSize: theme.font_size_subhead, textAlign: 'center' }}>
					Unable to display announcement details. Please go back and select a valid announcement.
				</Text>
			</View>
		);
	}

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Flex
					direction='row'
					justify='space-between'
					align='center'
					style={{
						width: '100%',
						padding: theme.v_spacing_md,
						borderBottomWidth: 0.25,
						borderBottomColor: theme.border_color_base,
						backgroundColor: theme.fill_base
					}}
				>
					<Button size='small' icon='left' onPress={() => {
						navigationRef.current?.goBack();
					}} />
					<Text style={{ fontSize: theme.font_size_subhead, fontWeight: '600' }}>
						Announcement
					</Text>
					<Button size='small' icon='left' style={{ opacity: 0 }} />
				</Flex>
			</TouchableWithoutFeedback>

			<ScrollView
				style={{ flex: 1 }}
				keyboardShouldPersistTaps='handled'
			>
				<Flex
					direction='column'
					justify='center'
					align='stretch'
					style={{
						width: '100%',
						backgroundColor: theme.fill_base,
						gap: theme.v_spacing_md
					}}
				>
					<Image
						source={{ uri: announcement.cover }}
						style={{
							width: '100%',
							height: 256,
							marginTop: theme.v_spacing_md
						}}
						resizeMode='cover'
					/>
					<Title level={3} style={{ paddingHorizontal: theme.h_spacing_md }}>{announcement.title}</Title>

					<View style={{ paddingHorizontal: theme.h_spacing_md }}>
						<Markdown>{announcement.content}</Markdown>
					</View>

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
								{announcement.author.name.first} {announcement.author.name.last}
							</Text>
						</Flex>
						<Text>
							{new Date(announcement.created_at).toLocaleDateString()}
						</Text>
					</Flex>

					<Flex direction='row' justify='between' align='center' gap={16} style={{ marginBottom: theme.v_spacing_md }}>
						<Pressable
							onPress={like}
							android_ripple={{
								color: theme.fill_mask,
								borderless: true
							}}
							style={{
								flex: 1,
								backgroundColor: 'transparent',
								paddingHorizontal: theme.h_spacing_md,
								paddingBottom: theme.v_spacing_sm
							}}
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
								borderless: true
							}}
							style={{
								flex: 1,
								backgroundColor: 'transparent',
								paddingHorizontal: theme.h_spacing_md,
								paddingVertical: theme.v_spacing_sm
							}}
						>
						<Flex
							direction='row'
								justify='end'
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
					</Flex>

					{currentAnnouncement?.comments && currentAnnouncement.comments.length > 0 && (
						<Flex direction='column' gap={theme.v_spacing_md}>
							<Title level={4}>Comments</Title>
							{currentAnnouncement.comments.map((comment) => (
								<Flex key={comment.id} direction='column' gap={4}>
									<Flex direction='row' align='center' gap={8}>
										<Avatar size='small' uri={comment.author.profilePicture} />
										<Text style={{ fontWeight: '600' }}>
											{comment.author.name.first} {comment.author.name.last}
										</Text>
										<Text style={{ fontSize: theme.font_size_caption }}>
											{new Date(comment.date).toLocaleDateString()}
										</Text>
									</Flex>
									<Text>{comment.content}</Text>
								</Flex>
							))}
						</Flex>
					)}
				</Flex>
			</ScrollView>
		</>
	);
};

export default ViewAnnouncement;