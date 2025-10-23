import React from 'react';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';

import { Toast, Flex, Icon, Tag } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Button from '../../../components/Button';
import Avatar from '../../../components/Avatar';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import theme from '../../../styles/theme';

const Cases = () => {
	const { cache } = useCache();
	const { refresh, setRefresh } = useRefresh();
	/** @typedef {import('../../../classes/Record').RecordProps} Record */
	const [records, setRecords] = React.useState(/** @type {Record[]} */([]));
	const id = cache.user?.id;

	React.useEffect(() => {
		if (!id) return;

		const controller = new AbortController();

		const fetchData = async () => {
			const recordResponse = await authFetch(
				`${API_Route}/users/student/${id}/records`,
				{ signal: controller.signal }
			);
			if (!recordResponse?.ok) {
				Toast.fail('Failed to fetch records', 2);
				return;
			}
			const recordData = await recordResponse.json();
			setRecords(recordData.records);
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
					<Button type='primary' size='small' icon='warning'>
						Report a Case
					</Button>
				</Flex>
			</Flex>

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
