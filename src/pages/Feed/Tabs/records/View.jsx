import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';

import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, Keyboard, Platform, View, Linking } from 'react-native';

import { ActivityIndicator, Flex, Tag } from '@ant-design/react-native';

import Text from '../../../../components/Text';
import Button from '../../../../components/Button';
import IconButton from '../../../../components/IconButton';
import Input from '../../../../components/forms/Input';
import Picker from '../../../../components/forms/Picker';

import { navigationRef } from '../../../../main';

import authFetch from '../../../../utils/authFetch';
import { API_Route } from '../../../../main';

import theme from '../../../../styles/theme';

/**
 * @type {React.FC<{
 * 	route: import('@react-navigation/native').RouteProp<any, 'ViewRecord'>;
 * }>}
 */
const New = ({ route }) => {
	/** @type {import('../../../../classes/Record').RecordProps | null} */
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

	/** @typedef {import('../../../../classes/Record').RecordProps} RecordProps */
	const [recordData, setRecordData] = React.useState(/** @type {RecordProps | null} */(null));
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchRecordData = async () => {
			setLoading(true);
			const response = await authFetch(`${API_Route}/records/${id}`);
			const data = await response.json();
			if (response.ok) {
				setRecordData(data);
			} else {
				console.error('Error fetching record data:', data);
			}
			setLoading(false);
		};

		fetchRecordData();
	}, [id]);

	if (loading || !recordData) return (
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
					gap={theme.v_spacing_lg}
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
								fontSize: theme.font_size_heading,
								fontWeight: '600',
								marginBottom: theme.v_spacing_md
							}}
						>
							Complaintants
						</Text>
					</Flex>
				</Flex>
			</ScrollView>
		</>
	);
};

export default New;
