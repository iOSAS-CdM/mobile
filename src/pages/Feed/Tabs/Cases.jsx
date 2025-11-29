import React from 'react';
import { View, ScrollView as RNScrollView, Dimensions } from 'react-native';

import { Flex, Icon, Tag, Modal } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Button from '../../../components/Button';
import Avatar from '../../../components/Avatar';
import ContentPage from '../../../components/ContentPage';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import theme from '../../../styles/theme';

import { navigationRef } from '../../../main';
import IconButton from '../../../components/IconButton';

const Cases = () => {
	const { cache } = useCache();

	return (
		<View style={{ flex: 1 }}>
			<ContentPage
				header={<Header />}
				fetchUrl={`${API_Route}/users/student/${cache.user?.id}/records`}
				cacheKey='records'
				transformItem={(item) => item.records || []}
				limit={10}
				contentGap={0}
				contentPadding={0}
				renderItem={(record) => <Case key={record.id} record={record} />}
			/>
		</View>
	);
};

const Header = () => {
	const { cache, updateCache } = useCache();
	const [modalVisible, setModalVisible] = React.useState(false);
	const { refresh } = useRefresh();
	const [loadingCases, setLoadingCases] = React.useState(false);
	const userId = cache.user?.id;
	const updateCacheRef = React.useRef(updateCache);

	React.useEffect(() => {
		updateCacheRef.current = updateCache;
	}, [updateCache]);

	const sortedCases = React.useMemo(() => {
		if (!Array.isArray(cache.cases)) return [];
		return [...cache.cases].sort((a, b) => {
			if (a.status === 'open' && b.status !== 'open') return -1;
			if (b.status === 'open' && a.status !== 'open') return 1;
			return new Date(b.created_at) - new Date(a.created_at);
		});
	}, [cache.cases]);

	React.useEffect(() => {
		if (!userId || typeof updateCache !== 'function') return;
		const controller = new AbortController();

		const fetchCases = async () => {
			setLoadingCases(true);
			try {
				const response = await authFetch(`${API_Route}/users/student/${userId}/cases`, {
					signal: controller.signal
				});
				if (response?.status === 0) return;
				if (!response?.ok) {
					console.error('Error fetching cases data:', response?.status, response?.statusText);
					return;
				};

				const data = await response.json().catch(() => null);
				if (!data) {
					console.error('Invalid cases data received');
					return;
				};

				const nextCases = Array.isArray(data?.cases) ? data.cases : Array.isArray(data) ? data : [];
				updateCacheRef.current?.('cases', nextCases);
			} catch (error) {
				if (String(error).toLowerCase().includes('aborted')) return;
				console.error('Error fetching cases data:', error);
			} finally {
				setLoadingCases(false);
			}
		};

		fetchCases();
		return () => controller.abort();
	}, [refresh, userId]);

	return (
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

					<Button size='small' type='primary' onPress={() => setModalVisible(true)}>
						Reports
					</Button>
				</Flex>
			</Flex>

			<Modal
				visible={modalVisible}
				transparent
				title='Your reports'
				animateAppear
				animationType='fade'
				onresponseClose={() => setModalVisible(false)}
				style={{ padding: 0, backgroundColor: theme.fill_body, width: Dimensions.get('window').width - 32, borderRadius: 8 }}
				footer={[
					{ text: 'Close', onPress: () => setModalVisible(false), style: { color: theme.color_text_caption } },
					{
						text: 'Create', onPress: () => {
							setModalVisible(false); navigationRef.current?.navigate('NewCase');
						}
					}
				]}
			>
				<RNScrollView style={{ maxHeight: 512, padding: theme.v_spacing_sm }}>
					<Flex direction='column' align='stretch'>
						{sortedCases.length === 0 && (
							<Flex direction='column' justify='center' align='center' style={{ padding: 32, gap: 8 }}>
								<Icon name='file-text' size={48} color={theme.color_icon_base} />
								<Text style={{ textAlign: 'center', color: theme.color_text_caption }}>
									No reports yet
								</Text>
								<Text style={{ textAlign: 'center', color: theme.color_text_caption, fontSize: theme.font_size_caption }}>
									Tap 'Create' to submit your first report
								</Text>
							</Flex>
						)}
						{sortedCases.map((caseItem) => (
							<Flex
								key={caseItem.id}
								direction='column'
								align='stretch'
								style={{
									width: '100%',
									padding: theme.v_spacing_sm,
									backgroundColor: caseItem.status !== 'closed' ? theme.fill_base : theme.fill_background,
									opacity: caseItem.status === 'closed' ? 0.5 : 1,
									gap: theme.v_spacing_sm,
									...caseItem.status === 'dismissed' ? {
										borderLeftWidth: 3,
										borderLeftColor: theme.brand_error
									} : caseItem.status === 'proceeded' ? {
										borderLeftWidth: 3,
										borderLeftColor: theme.brand_success
									} : {
										backgroundColor: theme.fill_background,
										opacity: 1
									}
								}}
								onPress={() => {
									setModalVisible(false);
									navigationRef.current?.navigate('ViewCase', { caseData: caseItem });
								}}
							>
								<Flex direction='row' align='start' justify='between'>
									<Flex direction='column' align='start' style={{ flex: 1 }}>
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
										<Tag small selected>{caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}</Tag>
										<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_icon_base }}>
											{new Date(caseItem.created_at).toLocaleDateString()}
										</Text>
									</Flex>
								</Flex>
								{caseItem.status === 'dismissed' && caseItem.dismissal_reason && (
									<Flex
										direction='column'
										align='stretch'
									>
										<Text style={{ fontSize: theme.font_size_icontext, fontWeight: '600', color: theme.brand_error }}>
											Dismissal Reason
										</Text>
										<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_text_secondary }}>
											{caseItem.dismissal_reason}
										</Text>
									</Flex>
								)}
							</Flex>
						))}
					</Flex>
				</RNScrollView>
			</Modal>
		</Flex>
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
			backgroundColor: record.tags.status !== 'ongoing' ? theme.fill_base : theme.fill_background,
			// filter: record.tags.status === 'ongoing' ? 'none' : 'grayscale(100%)',
			opacity: record.tags.status === 'ongoing' ? 1 : 0.75,
			borderBottomColor: theme.border_color_base,
			borderBottomWidth: theme.border_width_sm
		}}
		onPress={() => {
			navigationRef.current?.navigate('ViewRecord', { id: record.id });
		}}
	>
		<Flex
			style={{
				position: 'absolute',
				top: 8,
				right: 8,
				gap: theme.h_spacing_sm,
				zIndex: 10
			}}
		>
			{record.archived && (
				<Tag small>Archived</Tag>
			)}
			<Tag small>
				{record.violation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
			</Tag>
			{record.tags.status !== 'ongoing' && (
				<Tag small>
					{record.tags.status.charAt(0).toUpperCase() + record.tags.status.slice(1)}
				</Tag>
			)}
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
					grave: <Icon name='close-circle' color={theme.brand_error} size={theme.font_size_heading} />
				}[record.tags.severity]}{record.title}
			</Text>
			<Text style={{ fontSize: theme.font_size_base }}>
				{record.description}
			</Text>
			<Flex direction='row' justify='between' align='center' style={{ gap: theme.h_spacing_sm }}>
				<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_icon_base }}>
					{new Date(record.date).toLocaleDateString()}
				</Text>
			</Flex>
		</Flex>
	</Flex>
);

export default Cases;
