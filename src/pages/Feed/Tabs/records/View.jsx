import React from 'react';

import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, Keyboard, View, Linking } from 'react-native';

import { ActivityIndicator, Flex, Steps, Badge, Tooltip } from '@ant-design/react-native';

import Text from '../../../../components/Text';
import Button from '../../../../components/Button';
import IconButton from '../../../../components/IconButton';

import { navigationRef } from '../../../../main';

import authFetch from '../../../../utils/authFetch';
import { API_Route } from '../../../../main';
import { useCache } from '../../../../contexts/CacheContext';

import theme from '../../../../styles/theme';
import Avatar from '../../../../components/Avatar';

/**
 * @type {React.FC<{
 * 	route: import('@react-navigation/native').RouteProp<any, 'ViewRecord'>;
 * }>}
 */
const New = ({ route }) => {
	const id = route.params?.id || null;
	if (!id) {
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
					No Record Data
				</Text>
				<Text style={{ fontSize: theme.font_size_subhead, textAlign: 'center' }}>
					Unable to display record details. Please go back and select a valid record.
				</Text>
			</View>
		);
	};
	const { cache, pushToCache } = useCache();


	/** @typedef {import('../../../../classes/Record').RecordProps} RecordProps */
	const [recordData, setRecordData] = React.useState(/** @type {RecordProps | null} */(null));
	const [loadingRecord, setLoadingRecord] = React.useState(true);
	/** @typedef {{id: string, data: import('../../../../classes/Repository').RepositoryProps}} Repository */
	const [repository, setRepository] = React.useState(/** @type {Repository | null} */(null));
	const [loadingRepository, setLoadingRepository] = React.useState(true);

	React.useEffect(() => {
		const cachedRecord = cache.records?.find(r => r.id === id) || null;
		const cachedRepo = cache.repositories?.find(r => r.id === id) || null;

		if (cachedRecord || cachedRepo) {
			if (cachedRecord) {
				setRecordData(cachedRecord);
				setLoadingRecord(false);
			};
			if (cachedRepo) {
				setRepository(cachedRepo);
				setLoadingRepository(false);
			};
			// If both are present in cache, skip network fetches
			if (cachedRecord && cachedRepo) return;
		};

		const controller = new AbortController();

		const fetchRecordData = async () => {
			setLoadingRecord(true);
			const response = await authFetch(`${API_Route}/records/${id}`, { signal: controller.signal });
			if (response?.status === 0) return;
			setLoadingRecord(false);
			const data = await response.json();
			if (!response?.ok) {
				console.error('Error fetching record data:', data);
				return;
			};
			setRecordData(data);
			pushToCache('records', data, true);
		};
		const fetchRepositoryData = async () => {
			setLoadingRepository(true);
			const response = await authFetch(`${API_Route}/repositories/record/${id}`, { signal: controller.signal });
			if (response?.status === 0) return;
			setLoadingRepository(false);
			const data = await response.json();
			if (!response?.ok) {
				if (response.status !== 404) console.error('Error fetching repository data:', data);
				return;
			};
			setRepository({ id, data });
			pushToCache('repositories', { id, data }, true);
		};

		fetchRecordData();
		fetchRepositoryData();
		return () => controller.abort();
	}, [id]);

	if (loadingRecord || !recordData) return (
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
						Case Details
					</Text>
					<Button size='small' icon='left' style={{ opacity: 0 }} />
				</Flex>
			</TouchableWithoutFeedback>

			<Flex style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size='large' />
			</Flex>
		</>
	);

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
						Case Details
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
					gap={theme.v_spacing_md}
					style={{ flex: 1 }}
				>
					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={16}
						style={{
							width: '100%',
							padding: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_heading,
								fontWeight: '600',
								marginBottom: theme.v_spacing_md
							}}
						>
							{recordData.title}
						</Text>
						<Text style={{ fontSize: theme.font_size_base, lineHeight: theme.font_size_base * theme.line_height_paragraph }}>
							{recordData.description}
						</Text>

						<Flex
							direction='row'
							justify='flex-start'
							align='center'
							gap={8}
						>
							<Button size='small' style={{ fontSize: theme.font_size_caption }}>
								{recordData.violation}
							</Button>
							<Button size='small' style={{
								fontSize: theme.font_size_caption,
								backgroundColor: {
									minor: `${theme.brand_wait}1f`,
									major: `${theme.brand_warning}1f`,
									severe: `${theme.brand_danger}1f`
								}[recordData.tags.severity] || theme.fill_body,
								borderColor: {
									minor: theme.brand_wait,
									major: theme.brand_warning,
									severe: theme.brand_danger
								}[recordData.tags.severity] || theme.border_color_base,
								color: theme.text_color_inverse
							}}>
								{recordData.tags.severity.charAt(0).toUpperCase() + recordData.tags.severity.slice(1)}
							</Button>
							<Button size='small' style={{
								fontSize: theme.font_size_caption,
								backgroundColor: {
									ongoing: `${theme.brand_primary}1f`,
									resolved: `${theme.brand_success}1f`,
									dismissed: `${theme.brand_success}1f`
								}[recordData.tags.status] || theme.fill_body,
								borderColor: {
									ongoing: theme.brand_primary,
									resolved: theme.brand_success,
									dismissed: theme.brand_success
								}[recordData.tags.status] || theme.border_color_base,
								color: theme.text_color_inverse
							}}>
								{recordData.tags.status.charAt(0).toUpperCase() + recordData.tags.status.slice(1)}
							</Button>
						</Flex>
					</Flex>

					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={16}
						style={{
							width: '100%',
							padding: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Steps
							current={recordData.tags.progress}
							size='small'
							direction='vertical'
							style={{ width: '100%' }}
						>
							<Steps.Step title='Case Opened' />
							<Steps.Step title='Initial Interview' />
							<Steps.Step title='Respondent Interview' />
							<Steps.Step title='Resolution' />
							<Steps.Step title='Reconciliation' />
							<Steps.Step title='Clearance' />
						</Steps>
					</Flex>

					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={16}
						style={{
							width: '100%',
							padding: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_caption,
								fontWeight: '600'
							}}
						>
							Complainants
						</Text>
						{recordData.complainants.map((complaintant, index) => (
							<Flex
								key={index}
								direction='row'
								justify='flex-start'
								align='stretch'
								gap={8}
								style={{
									padding: 12,
									backgroundColor: complaintant.id === cache.user?.id ? theme.fill_background : theme.fill_body,
									borderRadius: theme.radius_md,
									elevation: complaintant.id === cache.user?.id ? 1 : 0
								}}
							>
								<Avatar
									source={{ uri: complaintant.profilePicture }}
									size={32}
								/>
								<Flex direction='column' justify='center' align='stretch'>
									<Text style={{ fontSize: theme.font_size_base, fontWeight: '600' }}>
										{complaintant.name.first} {complaintant.name.last}
									</Text>
									<Text style={{ fontSize: theme.font_size_base }}>
										{complaintant.id}
									</Text>
								</Flex>
							</Flex>
						))}
					</Flex>

					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={16}
						style={{
							width: '100%',
							padding: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_caption,
								fontWeight: '600'
							}}
						>
							Complainees
						</Text>
						{recordData.complainees.map((complainee, index) => (
							<Flex
								key={index}
								direction='row'
								justify='flex-start'
								align='stretch'
								gap={8}
								style={{
									padding: 12,
									backgroundColor: complainee.id === cache.user?.id ? theme.fill_background : theme.fill_body,
									borderRadius: theme.radius_md,
									elevation: complainee.id === cache.user?.id ? 1 : 0
								}}
							>
								{complainee.id === cache.user?.id && (
									<Tooltip content={`You have been reported ${complainee.occurrences} time(s).`} placement='bottom'>
										<Badge
											text={complainee.occurrences}
											color={theme.brand_warning}
											style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
										/>
									</Tooltip>
								)}
								<Avatar
									source={{ uri: complainee.student.profilePicture }}
									size={32}
								/>
								<Flex direction='column' justify='center' align='stretch'>
									<Text style={{ fontSize: theme.font_size_base, fontWeight: '600' }}>
										{complainee.student.name.first} {complainee.student.name.last}
									</Text>
									<Text style={{ fontSize: theme.font_size_base }}>
										{complainee.student.id}
									</Text>
								</Flex>
							</Flex>
						))}
					</Flex>

					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={16}
						style={{
							width: '100%',
							padding: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_caption,
								fontWeight: '600'
							}}
						>
							Repository
						</Text>
						{loadingRepository ? (
							<ActivityIndicator size='large' />
						) : repository?.data && repository.data.length > 0 ? repository.data.map((item, index) => (
							<Flex
								key={index}
								direction='column'
								justify='center'
								align='stretch'
								gap={8}
								style={{
									padding: theme.v_spacing_md,
									backgroundColor: theme.fill_body,
									borderRadius: theme.radius_md
								}}
							>
								<Text style={{ fontSize: theme.font_size_base, fontWeight: '600' }}>
									{item.name}
								</Text>
								<Button
									size='small'
									onPress={() => {
										Linking.openURL(item.publicUrl);
									}}
								>
									View Document
								</Button>
							</Flex>
						)) : (
							<Text style={{ fontSize: theme.font_size_base }}>
								No files found for this record.
							</Text>
						)}
					</Flex>
				</Flex>
			</ScrollView>
		</>
	);
};

export default New;
