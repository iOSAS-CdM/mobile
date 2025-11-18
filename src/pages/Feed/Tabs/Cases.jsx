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
	const { cache, updateCache } = useCache();
	const { refresh, setRefresh } = useRefresh();
	const [modalVisible, setModalVisible] = React.useState(false);
	const [loadingCases, setLoadingCases] = React.useState(false);

	// Listen for refresh events from manual refresh
	React.useEffect(() => {
		if (refresh?.key === 'cases' || refresh?.key === 'all') {
			fetchCases();
		};
	}, [refresh]);

	const fetchCases = async () => {
		try {
			setLoadingCases(true);
			const response = await authFetch(API_Route + '/cases');
			const data = await response.json();
			if (response?.status === 0) return;

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
			const response = await authFetch(`${API_Route}/users/student/${cache.user?.id}/cases`, {
				signal: controller.signal
			}).catch((error) => {
				console.error('Error fetching cases data:', error);
			});
			if (response?.status === 0) return;

			const data = await response.json();
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

					<Button size='small' type='primary' onPress={() => setModalVisible(true)}>
						Reports
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
				onresponseClose={() => setModalVisible(false)}
				style={{ padding: 0, backgroundColor: theme.fill_body, width: Dimensions.get('window').width - 32, borderRadius: 8 }}
				footer={[
					{ text: 'Close', onPress: () => setModalVisible(false) },
					{
						text: 'Create', onPress: () => {
							setModalVisible(false); navigationRef.current?.navigate('NewCase');
						}
					}
				]}
			>
				<RNScrollView style={{ maxHeight: 512, padding: theme.v_spacing_sm }}>
					<Flex direction='column' align='stretch'>
						{cache.cases.sort((a, b) => {
							if (a.status === 'open' && b.status !== 'open') return -1;
							if (b.status === 'open' && a.status !== 'open') return 1;
							// fallback: newest first
							return new Date(b.created_at) - new Date(a.created_at);
						}).map((caseItem) => (
							<Flex
								key={caseItem.id}
								direction='column'
								align='stretch'
								style={{
									width: '100%',
									padding: theme.v_spacing_sm,
									backgroundColor: caseItem.status !== 'closed' && theme.fill_base,
									opacity: caseItem.status === 'closed' ? 0.25 : 1,
									gap: theme.v_spacing_sm,
									opacity: 0.5,
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

			<ContentPage
				header={header}
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
			filter: record.tags.status === 'ongoing' ? 'none' : 'grayscale(100%)',
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
