import React from 'react';
import { View, ScrollView as RNScrollView, Dimensions } from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';

import { Flex, Icon, Tag, Modal } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Button from '../../../components/Button';
import Avatar from '../../../components/Avatar';
import ContentPage from '../../../components/ContentPage';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';
import { useWebSocketRefresh } from '../../../contexts/useWebSocketRefresh';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import theme from '../../../styles/theme';

import { navigationRef } from '../../../main';
import IconButton from '../../../components/IconButton';

const Cases = () => {
	const { cache, updateCache } = useCache();
	const { refresh, setRefresh } = useRefresh();
	const [modalVisible, setModalVisible] = React.useState(false);
	const [loadingCases, setLoadingCases] = React.useState(false);

	// Listen for refresh events from manual refresh
	React.useEffect(() => {
		if (refresh?.key === 'cases' || refresh?.key === 'all') {
			fetchCases();
		}
	}, [refresh]);

	// Listen for WebSocket refresh events
	useWebSocketRefresh('cases', ({ resource, timestamp }) => {
		console.log('WebSocket refresh received for cases:', { resource, timestamp });
		fetchCases();
	});

	const fetchCases = async () => {
		try {
			setLoadingCases(true);
			const response = await authFetch(API_Route + '/cases');
			const data = await response.json();

			if (response.ok) {
				updateCache(prev => ({
					...prev,
					cases: data
				}));
			};
		} catch (error) {
			console.error('Error fetching cases:', error);
		} finally {
			setLoadingCases(false);
		};
	};

	React.useEffect(() => { console.log(cache.records.length) }, [cache.records]);

	React.useEffect(() => {
		const controller = new AbortController();

		const fetchCases = async () => {
			setLoadingCases(true);
			const request = await authFetch(`${API_Route}/users/student/${cache.user?.id}/cases`, {
				signal: controller.signal
			}).catch((error) => {
				console.error('Error fetching cases data:', error);
			});

			const data = await request.json();
			if (!data) {
				console.error('Invalid cases data received');
				setLoadingCases(false);
				return;
			};

			updateCache('cases', data.cases || []);
			setLoadingCases(false);
		};

		fetchCases();
		return () => controller.abort();
	}, [refresh]);

	const header = (
		<Flex direction='column' align='stretch' style={{ padding: 16, backgroundColor: theme.fill_base }}>
			<Text>You have</Text>
			<Flex direction='row' justify='between' align='center'>
				<Text
					style={{
						fontSize: theme.font_size_heading,
						fontWeight: '600'
					}}
				>
					{cache.user?.ongoingCases} ongoing case{cache.user?.ongoingCases !== 1 ? 's' : ''}
				</Text>

				<Flex direction='row' justify='center' align='center' style={{ gap: theme.h_spacing_sm }}>
					<IconButton
						name='ellipsis'
						type='primary'
						size='small'
						onPress={() => setModalVisible(true)}
						/>
					<Button size='small' type='primary' onPress={() => {
							navigationRef.current?.navigate('NewCase');
						}}>
							Report a Case
						</Button>
					</Flex>
				</Flex>
		</Flex>
	);

	return (
		<View style={{ flex: 1 }}>
			<Modal
				visible={modalVisible}
				transparent
				title='Your reports'
				animateAppear
				animationType='fade'
				onRequestClose={() => setModalVisible(false)}
				style={{ padding: 0, backgroundColor: theme.fill_body, width: Dimensions.get('window').width - 32, borderRadius: 8 }}
				footer={[
					{ text: 'Close', onPress: () => setModalVisible(false) }
				]}
			>
				<RNScrollView style={{ maxHeight: 512, padding: theme.v_spacing_sm, gap: theme.v_spacing_sm }}>
					{cache.cases.sort((a, b) => {
						if (a.status === 'open' && b.status !== 'open') return -1;
						if (b.status === 'open' && a.status !== 'open') return 1;
						// fallback: newest first
						return new Date(b.created_at) - new Date(a.created_at);
					}).map((caseItem) => (
						<Flex
							key={caseItem.id}
							direction='row'
							align='start'
							justify='between'
							style={{
								width: '100%',
								padding: theme.v_spacing_sm,
								backgroundColor: caseItem.status !== 'closed' && theme.fill_base,
								borderRadius: theme.v_spacing_sm,
								opacity: caseItem.status === 'closed' ? 0.25 : 1
							}}
						>
							<Flex direction='column' align='start'>
								<Text
									style={{
										fontSize: theme.font_size_base,
										fontWeight: '600'
									}}
								>
									{caseItem.violation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
								</Text>
								<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_text_secondary }}>
									{caseItem.content}
								</Text>
							</Flex>

							<Flex direction='column' align='end' justify='center' style={{ gap: theme.v_spacing_sm }}>
								<Tag>{caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}</Tag>
								<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_icon_base }}>
									{new Date(caseItem.created_at).toLocaleDateString()}
								</Text>
							</Flex>
						</Flex>
					))}
				</RNScrollView>
			</Modal>

			<ContentPage
				header={header}
				fetchUrl={`${API_Route}/users/student/${cache.user?.id}/records`}
				cacheKey='records'
				transformItem={(item) => item.records || []}
				limit={10}
				contentPadding={0}
				renderItem={(record) => <Case key={record.id} record={record} />}
				refreshControl={(
					<RefreshControl
						refreshing={loadingCases}
						onRefresh={() => {
							setRefresh({
								key: 'records',
								seeds: Date.now()
							});
						}}
					/>
				)}
			/>
		</View>
	);
};

/**
 * @type {React.FC<{record: import('../../../classes/Record').RecordProps}>}
 */
const Case = ({ record }) => (
	<Flex
		key={record.id}
		direction='row'
		justify='between'
		align='center'
		style={{
			width: '100%',
			flex: 1,
			position: 'relative',
			padding: 16,
			backgroundColor: theme.fill_base,
			filter: record.tags.status === 'ongoing' ? 'none' : 'grayscale(100%)',
			opacity: record.tags.status === 'ongoing' ? 1 : 0.5
		}}
	>
		<Flex
			style={{
				position: 'absolute',
				top: 8,
				right: 8,
				zIndex: 10
			}}
		>
			{record.tags.status !== 'ongoing' && (
				<Tag small>
					{record.tags.status.charAt(0).toUpperCase() + record.tags.status.slice(1)}
				</Tag>
			)}
			<Tag small>
				{record.violation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
			</Tag>
		</Flex>
		<Flex
			direction='column'
			align='start'
			style={{ flex: 1, gap: theme.v_spacing_sm }}
		>
			<Text
				style={{
					fontSize: theme.font_size_heading,
					fontWeight: '600'
				}}
			>
				{{
					minor: '',
					major: <Icon name='warning' color={theme.brand_warning} size={theme.font_size_heading} />,
					severe: <Icon name='close-circle' color={theme.brand_error} size={theme.font_size_heading} />
				}[record.tags.severity]}{record.title}
			</Text>
			<Text style={{ fontSize: theme.font_size_base }}>
				{record.description}
			</Text>
			<Flex direction='row' justify='between' align='center' style={{ gap: theme.h_spacing_sm }}>
				<ScrollView horizontal style={{ flex: 1 }}>
					<Flex direction='row' align='center' style={{ gap: theme.h_spacing_sm }}>
						{[...record.complainants, ...record.complainees.map(c => c.student)].map((person, index) => (
							<Avatar
								key={index}
								size='small'
								uri={person.profilePicture}
							/>
						))}
					</Flex>
				</ScrollView>
				<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_icon_base }}>
					{new Date(record.date).toLocaleDateString()}
				</Text>
			</Flex>
		</Flex>
	</Flex>
);

export default Cases;
