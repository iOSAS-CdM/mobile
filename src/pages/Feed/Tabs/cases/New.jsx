import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';

import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, Keyboard, Platform, View } from 'react-native';

import { Flex, Tooltip, Toast } from '@ant-design/react-native';

import Text from '../../../../components/Text';
import Button from '../../../../components/Button';
import IconButton from '../../../../components/IconButton';
import Input from '../../../../components/forms/Input';
import Picker from '../../../../components/forms/Picker';
import { useCache } from '../../../../contexts/CacheContext';

import { navigationRef } from '../../../../main';

import authFetch from '../../../../utils/authFetch';
import { API_Route } from '../../../../main';

import theme from '../../../../styles/theme';

const New = () => {
	const { pushToCache } = useCache();
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm();

	const [submitting, setSubmitting] = React.useState(false);
	const [selectedFiles, setSelectedFiles] = React.useState([]);

	const pickFiles = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: '*/*',
				multiple: true,
				copyToCacheDirectory: true
			});

			if (!result.canceled && result.assets) {
				const newFiles = [...selectedFiles, ...result.assets];
				setSelectedFiles(newFiles);
				setValue('attachments', newFiles);
			}
		} catch (error) {
			Toast.fail('Failed to pick files', 1);
			console.error('File picker error:', error);
		};
	};

	const removeFile = (index) => {
		const newFiles = selectedFiles.filter((_, i) => i !== index);
		setSelectedFiles(newFiles);
		setValue('attachments', newFiles);
	};

	const onSubmit = async (data) => {
		setSubmitting(true);
		
		const formData = new FormData();
		formData.append('violation', data.violation);
		formData.append('content', data.content);
		for (const file of selectedFiles) {
			formData.append('attachments', {
				uri: file.uri,
				name: file.name,
				type: file.mimeType || 'application/octet-stream'
			});
		};

		const response = await authFetch(`${API_Route}/cases`, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			body: formData
		});
		if (response?.status === 0) return;
		if (!response?.ok) {
			Toast.fail('Failed to submit case', 2);
			setSubmitting(false);
			return;
		};
		const responseData = await response.json();
		pushToCache('cases', responseData, true);
		Toast.success('Case submitted successfully', 2);
		navigationRef.current?.goBack();
		
		setSubmitting(false);
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
						Report a New Case
					</Text>
					<Tooltip
						placement='bottom'
						content={`Please provide as much detail as possible when reporting a new case. This helps us address the issue effectively.`}
						crossOffset={{ top: 0 }}
					>
						<IconButton
							size='small'
							name='question'
						/>
					</Tooltip>
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
					gap={16}
					style={{
						width: '100%',
						padding: 16,
						backgroundColor: theme.fill_base
					}}
				>
					<Controller
						control={control}
						name='violation'
						rules={{
							required: 'Violation is required'
						}}
						render={({
							field: { onChange, value }
						}) => (
							<Picker
								data={[
									{ label: 'Bullying', value: 'bullying' },
									{ label: 'Cheating', value: 'cheating' },
									{ label: 'Disruptive Behavior', value: 'disruptive_behavior' },
									{ label: 'Fraud', value: 'fraud' },
									{ label: 'Gambling', value: 'gambling' },
									{ label: 'Harassment', value: 'harassment' },
									{ label: 'Improper Uniform', value: 'improper_uniform' },
									{ label: 'Litering', value: 'littering' },
									{ label: 'Plagiarism', value: 'plagiarism' },
									{ label: 'Possession of Prohibited Items', value: 'prohibited_items' },
									{ label: 'Vandalism', value: 'vandalism' },
									{ label: 'Other', value: 'other' }
								]}
								labelField='label'
								valueField='value'
								placeholder='Select Case Type'
								value={value}
								onChange={(item) => {
									onChange(item.value);
								}}
								withError={!!errors?.type}
								errorComponent={
									<Text
										style={{ color: theme.brand_error }}
									>{`${errors?.type?.message}`}</Text>
								}
								required
							/>
						)}
					/>

					<Controller
						control={control}
						name='content'
						rules={{
							required: 'Content is required',
							minLength: {
								value: 10,
								message: 'Content must be at least 10 characters'
							}
						}}
						render={({
							field: { onChange, onBlur, value }
						}) => (
							<Input
								placeholder='Content'
								type='text'
								name='content'
								required
								multiline
								numberOfLines={2}
								textAlignVertical='top'
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								withError={!!errors?.content}
								errorComponent={
									<Text
										style={{ color: theme.brand_error }}
									>{`${errors?.content?.message}`}</Text>
								}
							/>
						)}
					/>

					<View>
						<Button
							type='default'
							size='large'
							icon='paper-clip'
							onPress={pickFiles}
						>
							Attach Files (Optional)
						</Button>

						{selectedFiles.length > 0 && (
							<Flex
								direction='column'
								gap={8}
								style={{ marginTop: 12 }}
							>
								{selectedFiles.map((file, index) => (
									<Flex
										key={index}
										direction='row'
										justify='space-between'
										align='center'
										style={{
											padding: 12,
											backgroundColor: theme.fill_grey,
											borderRadius: 8
										}}
									>
										<Flex
											direction='column'
											style={{ flex: 1, marginRight: 8 }}
										>
											<Text
												numberOfLines={1}
												style={{
													fontWeight: '600',
													fontSize: theme.font_size_base
												}}
											>
												{file.name}
											</Text>
											{file.size && (
												<Text
													style={{
														fontSize: theme.font_size_caption,
														color: theme.color_text_caption
													}}
												>
													{(file.size / 1024).toFixed(2)} KB
												</Text>
											)}
										</Flex>
										<IconButton
											name='close'
											size='small'
											onPress={() => removeFile(index)}
										/>
									</Flex>
								))}
							</Flex>
						)}
					</View>

					<Button
						type='primary'
						size='large'
						loading={submitting}
						onPress={handleSubmit(onSubmit)}
					>
						Submit Case
					</Button>
				</Flex>
			</ScrollView>
		</>
	);
};

export default New;
