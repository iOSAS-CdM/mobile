import React from 'react';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';

import { Toast, Flex, Icon, Tag, Collapse } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Button from '../../../components/Button';
import Avatar from '../../../components/Avatar';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import theme from '../../../styles/theme';

import { navigationRef } from '../../../main';

const Cases = () => {
	const { cache, pushToCache } = useCache();
	const { refresh, setRefresh } = useRefresh();
	/** @typedef {import('../../../classes/Record').RecordProps} Record */
	const [records, setRecords] = React.useState(/** @type {Record[]} */([]));
	/** @typedef {import('../../../classes/Case').CaseProps} Case */
	const [cases, setCases] = React.useState(/** @type {Case[]} */([]));
	const id = cache.user?.id;

	React.useEffect(() => {
		if (!id) return;

		const controller = new AbortController();

		const fetchData = async () => {
			try {
				const [recordsRes, casesRes] = await Promise.all([
					authFetch(`${API_Route}/users/student/${id}/records`, { signal: controller.signal }),
					authFetch(`${API_Route}/users/student/${id}/cases`, { signal: controller.signal })
				]);

				if (!recordsRes?.ok) {
					Toast.fail('Failed to fetch records', 2);
					return;
				};
				if (!casesRes?.ok) {
					Toast.fail('Failed to fetch cases', 2);
					return;
				};

				const [recordsData, casesData] = await Promise.all([recordsRes.json(), casesRes.json()]);

				if (recordsData) {
					setRecords(recordsData.records);
					pushToCache('records', recordsData.records, false);
				};
				if (casesData) {
					setCases(casesData.cases);
					pushToCache('cases', casesData.cases, false);
				};
			} catch (err) {
				if (err.name === 'AbortError') return;
				Toast.fail('Failed to fetch data', 2);
				console.error(err);
			};
		};

		fetchData();
		return () => controller.abort();
	}, [id, refresh]);

	return (
		<ScrollView
			style={{ flex: 1 }}
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
		>
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
							{
								records.filter(
									(record) =>
										record.tags.status === 'ongoing'
								).length
							}
						</Text>{' '}
						unresolved case{records.filter(
							(record) =>
								record.tags.status === 'ongoing'
						).length !== 1 ? 's' : ''}.
					</Text>
					<Button type='primary' size='small' icon='warning' onPress={() => {
						navigationRef.current?.navigate('NewCase');
					}}>
						Report a Case
					</Button>
				</Flex>
			</Flex>

			{cases.length > 0 && (
				<Collapse
					style={{ backgroundColor: theme.fill_base }}
					defaultActiveKey={['cases']}
				>
					<Collapse.Panel title={<Text style={{ fontSize: theme.font_size_base }}>Your Reports</Text>} key='reports'>
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
									direction='row'
									justify='between'
									align='center'
									style={{
										position: 'relative',
										padding: theme.v_spacing_sm,
										backgroundColor: theme.fill_base,
										borderRadius: theme.radius_md,
										borderWidth: theme.border_width_sm,
										borderColor: theme.border_color_base,
										filter: caseItem.status === 'open' ? 'none' : 'grayscale(100%)'
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
									<Flex
										direction='row'
										align='center'
										style={{ flex: 1, gap: theme.v_spacing_sm, overflow: 'hidden' }}
									>
										<Text
											style={{
												fontSize: theme.font_size_heading,
												fontWeight: '600'
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
												'littering': 'Litering',
												'plagiarism': 'Plagiarism',
												'prohibited_items': 'Possession of Prohibited Items',
												'vandalism': 'Vandalism',
												'other': 'Other',
											}[caseItem.violation]}
										</Text>
										<Text style={{ fontSize: theme.font_size_base, color: theme.color_text_secondary, overflow: 'hidden' }}>
											{caseItem.content}
										</Text>
									</Flex>
								</Flex>
							))}
						</Flex>
					</Collapse.Panel>
				</Collapse>
			)}

			<Flex
				direction='column'
				align='start'
				style={{
					paddingVertical: theme.v_spacing_sm,
					gap: theme.v_spacing_sm
				}}
			>
				{records.filter((record) => record.tags.status === 'ongoing').map((record) => (
					<Case key={record.id} record={record} />
				))}
				{records.filter((record) => record.tags.status === 'resolved').map((record) => (
					<Case key={record.id} record={record} />
				))}
				{records.filter((record) => record.tags.status === 'dismissed').map((record) => (
					<Case key={record.id} record={record} />
				))}
			</Flex>
		</ScrollView>
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
			filter: record.tags.status === 'ongoing' ? 'none' : 'grayscale(100%)'
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
				}[record.tags.severity]} {record.title}
			</Text>
			<Text style={{ fontSize: theme.font_size_base }}>
				{record.description}
			</Text>
			<Flex direction='row' justify='between' align='center' style={{ gap: theme.h_spacing_sm }}>
				<ScrollView horizontal style={{ width: 'auto', gap: theme.h_spacing_sm }}>
					{record.complainants.map((complainant) => (
						<Avatar
							key={complainant.id}
							size='small'
							uri={complainant.profilePicture}
						/>
					))}
					{record.complainees.map((complainee) => (
						<Avatar
							key={complainee.id}
							size='small'
							uri={complainee.student?.profilePicture}
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
