import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';

import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, Keyboard, Platform, View, Linking } from 'react-native';

import { Flex, Tag } from '@ant-design/react-native';

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
 * 	route: import('@react-navigation/native').RouteProp<any, 'ViewCase'>;
 * }>}
 */
const New = ({ route }) => {
	/** @type {import('../../../../classes/Case').CaseProps | null} */
	const caseData = route.params?.caseData || null;
	if (!caseData) {
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
					No Case Data
				</Text>
				<Text style={{ fontSize: theme.font_size_subhead, textAlign: 'center' }}>
					Unable to display case details. Please go back and select a valid case.
				</Text>
			</View>
		);
	};

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Flex
					direction='row'
					justify='space-between'
					align='center'
					style={{
						height: Platform.OS === 'ios' ? 32 * 1.5 : 32,
						width: '100%',
						paddingHorizontal: 16,
						borderBottomWidth: 0.25,
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
					style={{
						width: '100%',
						padding: 16,
						backgroundColor: theme.fill_base
					}}
				>
					<Text style={{ fontSize: theme.font_size_heading, fontWeight: '500' }}>
						{caseData.violation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
					</Text>

					<Tag selected small style={{ position: 'absolute', top: 16, right: 16 }}>
						{caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
					</Tag>

					<Text>
						{caseData.content}
					</Text>
					<Text>
						Reported On: {new Date(caseData.created_at).toLocaleDateString()}
					</Text>

					<Flex
						direction='column'
						align='start'
						justify='start'
						gap={theme.v_spacing_sm}
					>
						<Text style={{ fontWeight: '600' }}>Attachments:</Text>
						{caseData.attachments && caseData.attachments.length > 0 ? (
							caseData.attachments.map((attachment, index) => (
								<Text
									key={index}
									style={{
										color: theme.link_color,
										textDecorationLine: 'underline'
									}}
									onPress={() => {
										// Open attachment URL
										Linking.openURL(attachment.publicUrl);
									}}
								>
									{attachment.name}
								</Text>
							))
						) : (
							<Text>No attachments provided.</Text>
						)}
					</Flex>
				</Flex>
			</ScrollView>
		</>
	);
};

export default New;
