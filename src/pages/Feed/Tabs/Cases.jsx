import React from 'react';
import { View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { Toast, Flex, Icon, Tag, Collapse } from '@ant-design/react-native';

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

const Cases = () => {
	const { cache } = useCache();
	const { refresh, setRefresh } = useRefresh();

	// Read from cache
	const records = cache.records || [];
	const cases = cache.cases || [];
	const id = cache.user?.id;

	// Separate records by status
	const ongoingRecords = records.filter(record => record.tags.status === 'ongoing');
	const resolvedRecords = records.filter(record => record.tags.status === 'resolved');
	const dismissedRecords = records.filter(record => record.tags.status === 'dismissed');
	const allRecordsOrdered = [...ongoingRecords, ...resolvedRecords, ...dismissedRecords];

	return (
		<View style={{ flex: 1 }}>
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
								{ongoingRecords.length}
							</Text>{' '}
							unresolved case{ongoingRecords.length !== 1 ? 's' : ''}.
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

				{/* Use ContentPage for infinite scrolling records */}
				{id && (
					<ContentPage
						fetchUrl={`${API_Route}/users/student/${id}/records`}
						cacheKey="records"
						pageSize={10}
						transformData={(data) => data.records || []}
						renderItem={(record, index) => <Case key={record.id} record={record} />}
						emptyText="No records found"
					/>
				)}
			</ScrollView>
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
