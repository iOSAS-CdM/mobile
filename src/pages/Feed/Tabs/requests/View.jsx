import React from 'react';

import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

import { Flex, Tag } from '@ant-design/react-native';

import Text from '../../../../components/Text';
import Button from '../../../../components/Button';

import { navigationRef } from '../../../../main';

import theme from '../../../../styles/theme';

/**
 * @type {React.FC<{
 * 	route: import('@react-navigation/native').RouteProp<any, 'ViewRequest'>;
 * }>}
 */
const ViewRequest = ({ route }) => {
	/** @type {import('../../../../classes/Request').RequestProps | null} */
	const requestData = route.params?.requestData || null;

	if (!requestData) {
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
					No Request Data
				</Text>
				<Text style={{ fontSize: theme.font_size_subhead, textAlign: 'center' }}>
					Unable to display request details. Please go back and select a valid request.
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
						Request Details
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
						{requestData.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
					</Text>

					<Tag
						selected
						small
						style={{
							position: 'absolute',
							top: 16,
							right: 16
						}}
					>
						{requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1)}
					</Tag>

					{requestData.message && (
						<Flex
							direction='column'
							align='stretch'
							gap={theme.v_spacing_sm}
						>
							<Text style={{ fontWeight: '600', fontSize: theme.font_size_subhead }}>
								Your Message:
							</Text>
							<Text>
								{requestData.message}
							</Text>
						</Flex>
					)}

					<Text style={{ color: theme.color_text_secondary }}>
						Submitted on: {new Date(requestData.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</Text>

					{requestData.updated_at && requestData.updated_at !== requestData.created_at && (
						<Text style={{ color: theme.color_text_secondary }}>
							Last updated: {new Date(requestData.updated_at).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</Text>
					)}

					{requestData.response && (
						<Flex
							direction='column'
							align='stretch'
							gap={theme.v_spacing_sm}
							style={{
								backgroundColor: theme.fill_body,
								padding: theme.v_spacing_md,
								borderRadius: theme.v_spacing_sm,
								borderLeftWidth: 4,
								borderLeftColor: requestData.status === 'accepted'
									? theme.brand_success
									: theme.brand_error
							}}
						>
							<Text style={{
								fontSize: theme.font_size_subhead,
								fontWeight: '600',
								color: requestData.status === 'accepted'
									? theme.brand_success
									: theme.brand_error
							}}>
								Staff Response
							</Text>
							<Text style={{ color: theme.color_text_secondary }}>
								{requestData.response}
							</Text>
						</Flex>
					)}

					{requestData.status === 'open' && (
						<Flex
							direction='column'
							align='stretch'
							gap={theme.v_spacing_sm}
							style={{
								backgroundColor: theme.fill_body,
								padding: theme.v_spacing_md,
								borderRadius: theme.v_spacing_sm,
								borderLeftWidth: 4,
								borderLeftColor: theme.brand_primary
							}}
						>
							<Text style={{
								fontSize: theme.font_size_subhead,
								fontWeight: '600',
								color: theme.brand_primary
							}}>
								Pending Review
							</Text>
							<Text style={{ color: theme.color_text_secondary }}>
								Your request is currently being reviewed by the administrative staff. You will be notified once it has been processed.
							</Text>
						</Flex>
					)}
				</Flex>
			</ScrollView>
		</>
	);
};

export default ViewRequest;
