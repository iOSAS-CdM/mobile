import React from 'react';

import { ScrollView, Image, Pressable, TextInput, Alert } from 'react-native';
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

import { Flex, Modal } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';
import Ionicons from '@expo/vector-icons/Ionicons';

import Text from '../../../../components/Text';
import Title from '../../../../components/Title';
import Button from '../../../../components/Button';
import Avatar from '../../../../components/Avatar';
import Input from '../../../../components/forms/Input';
import IconButton from '../../../../components/IconButton';

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
	const setAnnouncement = route.params?.setAnnouncement || (() => {});
	const { cache, updateCacheItem, pushToCache } = useCache();
	const [currentAnnouncement, setCurrentAnnouncement] = React.useState(announcement);
	const [commentText, setCommentText] = React.useState('');
	const [postingComment, setPostingComment] = React.useState(false);

	const like = async () => {
		if (!cache.user || !currentAnnouncement) return;
		const update  = (prev) => {
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
		};
		setCurrentAnnouncement(update);
		setAnnouncement(update);

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

	const postComment = async () => {
		if (!commentText || commentText.trim().length === 0) return;
		if (!cache.user) return;
		setPostingComment(true);
		try {
			const body = { content: commentText.trim() };
			const response = await authFetch(`${API_Route}/announcements/${currentAnnouncement.id}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (response?.status === 0) return; // aborted

			let newComment = null;
			if (response && response.ok) {
				try {
					const data = await response.json();
					// Expect backend to return created comment
					newComment = data.comment || data || null;
				} catch (e) {
					// ignore
				};
			};

			// Fallback to optimistic comment if backend didn't return one
			if (!newComment) {
				newComment = {
					id: `temp-${Date.now()}`,
					author: cache.user,
					content: commentText.trim(),
					date: new Date().toISOString()
				};
			};

			// Update local state
			setCurrentAnnouncement(prev => {
				const updated = { ...prev, comments: [...(prev.comments || []), newComment] };
				return updated;
			});

			// If a parent passed a setter (e.g., Home or Calendar), update it too
			if (typeof setAnnouncement === 'function') {
				setAnnouncement(prev => {
					const updatedPrev = typeof prev === 'function' ? prev(currentAnnouncement) : prev || currentAnnouncement;
					return { ...updatedPrev, comments: [...(updatedPrev.comments || []), newComment] };
				});
			}

			// Update cache: try to update existing announcement in cache
			try {
				updateCacheItem && updateCacheItem('announcements', 'id', currentAnnouncement.id, { comments: [...(currentAnnouncement.comments || []), newComment] });
			} catch (e) {
				// if updateCacheItem not available or fails, push to cache list
				try { pushToCache('announcements', { ...currentAnnouncement, comments: [...(currentAnnouncement.comments || []), newComment] }, true); } catch (e) { /* ignore */ }
			};

			setCommentText('');
		} catch (err) {
			console.error('Failed to post comment:', err);
		} finally {
			setPostingComment(false);
		};
	};

	const deleteComment = async (commentId) => {
		if (!cache.user || !currentAnnouncement) return;

		// Find the comment and its index so we can restore it if needed
		const priorComments = currentAnnouncement.comments || [];
		const idx = priorComments.findIndex((c) => String(c.id) === String(commentId));
		if (idx === -1) return;
		const priorComment = priorComments[idx];

		// Optimistically remove locally
		setCurrentAnnouncement((prev) => ({
			...prev,
			comments: (prev.comments || []).filter((c) => String(c.id) !== String(commentId))
		}));
		try {
			updateCacheItem && updateCacheItem('announcements', 'id', currentAnnouncement.id, { comments: (currentAnnouncement.comments || []).filter(c => String(c.id) !== String(commentId)) });
		} catch (e) {
			try { pushToCache('announcements', { ...currentAnnouncement, comments: (currentAnnouncement.comments || []).filter(c => String(c.id) !== String(commentId)) }, true); } catch (e) { /* ignore */ }
		};

		// Send delete request; assume success. If it fails, restore the comment and return it.
		try {
			const response = await authFetch(`${API_Route}/announcements/${currentAnnouncement.id}/comments/${commentId}`, {
				method: 'DELETE'
			});
			if (!response || !response.ok) {
				// restore comment locally
				setCurrentAnnouncement((prev) => {
					const comments = prev.comments || [];
					// insert at original index if possible
					const before = comments.slice(0, idx);
					const after = comments.slice(idx);
					return { ...prev, comments: [...before, priorComment, ...after] };
				});
				try { updateCacheItem && updateCacheItem('announcements', 'id', currentAnnouncement.id, { comments: (currentAnnouncement.comments || []).concat([priorComment]) }); } catch (e) { try { pushToCache('announcements', { ...currentAnnouncement, comments: (currentAnnouncement.comments || []).concat([priorComment]) }, true); } catch (e) { /* ignore */ } }
				Modal.alert('Error', 'Failed to delete comment. Your comment was restored.', [{
					text: 'OK'
				}]);
				return priorComment;
			};
			return true;
		} catch (e) {
			// restore comment locally on network/error
			setCurrentAnnouncement((prev) => {
				const comments = prev.comments || [];
				const before = comments.slice(0, idx);
				const after = comments.slice(idx);
				return { ...prev, comments: [...before, priorComment, ...after] };
			});
			try { updateCacheItem && updateCacheItem('announcements', 'id', currentAnnouncement.id, { comments: (currentAnnouncement.comments || []).concat([priorComment]) }); } catch (e) { try { pushToCache('announcements', { ...currentAnnouncement, comments: (currentAnnouncement.comments || []).concat([priorComment]) }, true); } catch (e) { /* ignore */ } }
			console.error('Failed to delete comment', e);
			Modal.alert('Error', 'Failed to delete comment. Your comment was restored.', [{
				text: 'OK'
			}]);
			return priorComment;
		}
	};

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
								borderless: false
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
										currentAnnouncement.likes?.find(
											(like) => like.author.id === cache.user?.id
										)
											? 'heart'
											: 'heart-outline'
									}
									color={
										currentAnnouncement.likes?.find(
											(like) => like.author.id === cache.user?.id
										)
											? theme.brand_primary
											: theme.text_color_base
									}
								/>
								<Text>
									{currentAnnouncement.likes?.length} like
									{currentAnnouncement.likes?.length !== 1 && 's'}
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
						>
						<Flex
							direction='row'
								justify='end'
							align='center'
							gap={8}
						>
							<Ionicons name='chatbubble-outline' />
							<Text>
									{currentAnnouncement.comments?.length} comment
									{currentAnnouncement.comments?.length !== 1 && 's'}
								</Text>
							</Flex>
						</Pressable>
					</Flex>

					{currentAnnouncement?.comments && currentAnnouncement.comments.length > 0 && (
						<Flex direction='column' align='stretch' gap={theme.v_spacing_md} style={{ width: '100%', paddingHorizontal: theme.h_spacing_md, marginBottom: theme.v_spacing_md }}>
							<Title level={4}>Comments</Title>
							{currentAnnouncement.comments.map((comment) => (
								<Pressable
									key={comment.id}
									onLongPress={() => {
										// Allow long-press deletion only for the comment author
										if (!cache.user || String(cache.user.id) !== String(comment.author.id)) return;
										Modal.alert('Delete comment', 'Are you sure you want to delete this comment?', [
											{ text: 'Cancel', style: 'cancel' },
											{ text: 'Delete', style: 'destructive', onPress: () => deleteComment(comment.id) }
										]);
									}}
									android_ripple={{ color: theme.fill_mask }}
								>
									<Flex direction='column' align='stretch' gap={4}>
										<Flex direction='row' justify='between' align='center' gap={8}>
											<Flex direction='row' align='center' gap={8}>
												<Avatar size='small' uri={comment.author.profilePicture} />
												<Text style={{ fontWeight: '600' }}>
													{comment.author.name.first} {comment.author.name.last}
												</Text>
											</Flex>
											<Text style={{ color: theme.color_text_secondary }}>
											{new Date(comment.date).toLocaleDateString()}
										</Text>
									</Flex>
									<Text>{comment.content}</Text>
									</Flex>
								</Pressable>
							))}
						</Flex>
					)}
				</Flex>
			</ScrollView>

			{/* Comment composer */}
			<View style={{ padding: theme.h_spacing_md, borderTopWidth: 0.5, borderTopColor: theme.border_color_base, backgroundColor: theme.fill_base }}>
				<Flex direction='row' align='center' gap={8}>
					<Input
						placeholder='Write a comment...'
						value={commentText}
						multiline
						onChangeText={setCommentText}
						editable={!postingComment}
						wrapperStyle={{ flex: 1 }}
					/>
					<IconButton
						name='send'
						size={32}
						type={postingComment || !commentText.trim() ? 'default' : 'primary'}
						onPress={postComment}
						disabled={postingComment || !commentText.trim()}
					/>
				</Flex>
			</View>
		</>
	);
};

export default ViewAnnouncement;