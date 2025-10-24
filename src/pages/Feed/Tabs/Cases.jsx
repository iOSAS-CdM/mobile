import React from 'react';
import { View, ScrollView as RNScrollView, ActivityIndicator } from 'react-native';
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

const Cases = () => {
	const { cache, updateCache } = useCache();
	const { setRefresh } = useRefresh();
	const [modalVisible, setModalVisible] = React.useState(false);
	const [loadingCases, setLoadingCases] = React.useState(false);

	// Listen for WebSocket refresh messages for records and cases
	useWebSocketRefresh(['records', 'cases'], ({ resource, timestamp }) => {
		console.log(`Cases page: Received refresh for ${resource || 'all'} at ${timestamp}`);
		setRefresh({
			key: 'user',
			seed: Math.random(),
			source: 'websocket',
			resource
		});
	});

	// Read from cache
	const records = cache.records || [];
	const cases = cache.cases || [];
	const id = cache.user?.id;

	// Function to fetch cases
	const fetchCases = React.useCallback(async () => {
		if (!id) return;

		setLoadingCases(true);
		const response = await authFetch(`${API_Route}/users/student/${id}/cases`)
			.catch((error) => error);
		if (!response?.ok) {
			console.error('Error fetching cases:', response);
			setLoadingCases(false);
			return;
		};
		const data = await response.json();
		console.log('Fetched cases data:', data);
		if (data?.cases) {
			console.log('Fetched cases:', data.cases);
			// Update cache with the fetched cases
			updateCache('cases', data.cases);
		};
		setLoadingCases(false);
	}, [id, updateCache]);

	// Fetch cases when modal opens
	const handleOpenModal = () => {
		setModalVisible(true);
		fetchCases();
	};

	// Separate records by status
	const ongoingRecords = records.filter(record => record.tags.status === 'ongoing');

	// Debug logging
	React.useEffect(() => {
		console.log('Cases component - cases from cache:', cases);
		console.log('Cases component - cases.length:', cases.length);
	}, [cases]);

	// Create header component
	const ListHeaderComponent = () => (
		<>
			<Flex
				direction='column'
				align='start'
				style={{ padding: 16, backgroundColor: theme.fill_base }}
			>
				<Text style={{ fontSize: theme.font_size_caption_sm }}>
					You have
				</Text>
				<Flex
					direction='row'
					justify='between'
					align='center'
					style={{ width: '100%' }}
				>
					<Text style={{ fontSize: theme.font_size_base }}>
						<Text
							style={{
								fontSize: theme.font_size_caption,
								color: theme.brand_primary,
								fontWeight: '600',
								textDecorationLine: 'underline'
							}}
						>
							{ongoingRecords.length}
						</Text>{' '}
						unresolved case{ongoingRecords.length !== 1 ? 's' : ''}.
					</Text>
					<Flex justify='end' style={{ gap: theme.h_spacing_sm }}>
						<Button
							size='small'
							icon='ordered-list'
							onPress={handleOpenModal}
						/>
						<Button type='primary' size='small' icon='warning' onPress={() => {
							navigationRef.current?.navigate('NewCase');
						}}>
							Report a Case
						</Button>
					</Flex>
				</Flex>
			</Flex>
		</>
	);

	return (
		<View style={{ flex: 1 }}>
			<Modal
				visible={modalVisible}
				transparent
				onClose={() => setModalVisible(false)}
				title="Your Reports"
				footer={[
					{
						text: 'Close',
						onPress: () => setModalVisible(false)
					}
				]}
			>
				<RNScrollView style={{ maxHeight: 400 }}>
					{loadingCases && cases.length === 0 ? (
						<View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
							<ActivityIndicator size="large" color={theme.brand_primary} />
							<Text style={{ marginTop: 16, color: theme.color_text_secondary }}>
								Loading your reports...
							</Text>
						</View>
					) : cases.length === 0 ? (
						<View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
							<Text style={{ color: theme.color_text_secondary }}>
								No reports found
							</Text>
						</View>
					) : (
								<Flex
									direction='column'
									align='start'
									style={{
										paddingVertical: theme.v_spacing_sm,
										gap: theme.v_spacing_sm
									}}
								>
									{cases.map((caseItem) => (
							<Flex
								key={caseItem.id}
								direction='column'
								align='start'
								style={{
									position: 'relative',
									padding: theme.v_spacing_sm,
									backgroundColor: theme.fill_base,
									borderRadius: theme.radius_md,
									borderWidth: theme.border_width_sm,
									borderColor: theme.border_color_base,
									width: '100%',
									opacity: caseItem.status === 'open' ? 1 : 0.6
								}}
							>
								{caseItem.status === 'open' && (
									<Tag
										selected
										style={{
											position: 'absolute',
											top: 4,
											right: 8,
											zIndex: 10
										}}
									>
										{caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
									</Tag>
								)}
								<Text
									style={{
										fontSize: theme.font_size_heading,
										fontWeight: '600',
										marginBottom: theme.v_spacing_sm
									}}
								>
									{{
										'bullying': 'Bullying',
										'cheating': 'Cheating',
										'disruptive_behavior': 'Disruptive Behavior',
										'fraud': 'Fraud',
										'gambling': 'Gambling',
										'harassment': 'Harassment',
										'improper_uniform': 'Improper Uniform',
										'littering': 'Littering',
										'plagiarism': 'Plagiarism',
										'prohibited_items': 'Possession of Prohibited Items',
										'vandalism': 'Vandalism',
										'other': 'Other',
									}[caseItem.violation]}
								</Text>
								<Text style={{ fontSize: theme.font_size_base, color: theme.color_text_secondary }}>
									{caseItem.content}
								</Text>
							</Flex>
						))}
								</Flex>
					)}
				</RNScrollView>
			</Modal>

			{id && (
				<ContentPage
					fetchUrl={`${API_Route}/users/student/${id}/records`}
					cacheKey='records'
					pageSize={10}
					transformData={(data) => {
						const records = data.records || [];
						// sort so that ongoing records come first, then by date (newest first)
						return [...records].sort((a, b) => {
							const aOngoing = a.tags?.status === 'ongoing';
							const bOngoing = b.tags?.status === 'ongoing';
							if (aOngoing && !bOngoing) return -1;
							if (bOngoing && !aOngoing) return 1;
							const aTime = Date.parse(a.date) || 0;
							const bTime = Date.parse(b.date) || 0;
							return bTime - aTime;
						});
					}}
					renderItem={(record, index) => <Case key={record.id} record={record} />}
					emptyText='No records found'
					ListHeaderComponent={ListHeaderComponent}
					refreshControl={
						<RefreshControl
							refreshing={false}
							onRefresh={async () => {
								setRefresh({
									key: 'user',
									seed: Math.random()
								});
							}}
							colors={[theme.brand_primary]}
							tintColor={theme.brand_primary}
						/>
					}
				/>
			)}
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
			position: 'relative',
			padding: 16,
			backgroundColor: theme.fill_base,
			filter: record.tags.status === 'ongoing' ? 'none' : 'grayscale(100%)',
			opacity: record.tags.status === 'ongoing' ? 1 : 0.5
		}}
	>
		{record.tags.status !== 'ongoing' && (
			<Tag
				style={{
					position: 'absolute',
					top: 8,
					right: 8,
					zIndex: 10
				}}
			>
				{record.tags.status.charAt(0).toUpperCase() + record.tags.status.slice(1)}
			</Tag>
		)}
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
				<ScrollView horizontal style={{ flex: 1, gap: theme.h_spacing_sm }}>
					{[...record.complainants, ...record.complainees.map(c => c.student)].map((person, index) => (
						<Avatar
							key={index}
							size='small'
							uri={person.profilePicture}
						/>
					))}
				</ScrollView>
				<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_icon_base }}>
					{new Date(record.date).toLocaleDateString()}
				</Text>
			</Flex>
		</Flex>
	</Flex>
);

export default Cases;
