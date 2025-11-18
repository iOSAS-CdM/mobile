import React from 'react';
import { ScrollView, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { Flex, Toast } from '@ant-design/react-native';

import Text from '../../../../components/Text';
import Button from '../../../../components/Button';
import Input from '../../../../components/forms/Input';
import Picker from '../../../../components/forms/Picker';

import { navigationRef, API_Route } from '../../../../main';
import { useCache } from '../../../../contexts/CacheContext';
import authFetch from '../../../../utils/authFetch';

import theme from '../../../../styles/theme';

const NewRequest = () => {
	const { pushToCache } = useCache();
	const { control, handleSubmit } = useForm({
		defaultValues: {
			type: 'good_moral',
			message: ''
		}
	});

	const [submitting, setSubmitting] = React.useState(false);

	const requestTypes = [
		{ label: 'Good Moral Certification', value: 'good_moral' },
		{ label: 'Clearance', value: 'clearance' },
		{ label: 'Transfer Credentials', value: 'transfer_credentials' },
		{ label: 'Other', value: 'other' }
	];

	const onSubmit = async (values) => {
		setSubmitting(true);
		try {
			const response = await authFetch(`${API_Route}/requests`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: values.type,
					message: values.message
				})
			});

			if (response?.status === 0) {
				setSubmitting(false);
				return;
			};

			if (!response?.ok) {
				Toast.fail(`Failed to submit request: ${response?.statusText || 'Unknown'}`, 2);
				setSubmitting(false);
				return;
			};

			const data = await response.json().catch(() => null);
			if (data) pushToCache('requests', data, true);

			Toast.success('Request submitted successfully', 2);
			navigationRef.current?.goBack();
		} catch (e) {
			console.error('Submit error', e);
			Toast.fail('Failed to submit request', 2);
		} finally {
			setSubmitting(false);
		};
	};

	return (
		<>
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
				<Button size='small' icon='left' onPress={() => navigationRef.current?.goBack()} />
				<Text style={{ fontSize: theme.font_size_subhead, fontWeight: '600' }}>New Request</Text>
				<Button size='small' icon='left' style={{ opacity: 0 }} />
			</Flex>

			<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
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
					<View>
						<Text style={{ fontSize: theme.font_size_base, marginBottom: 8, fontWeight: '500' }}>
							Request Type
						</Text>
						<Controller
							control={control}
							name='type'
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<Picker
									data={requestTypes}
									labelField='label'
									valueField='value'
									value={value}
									onChange={(item) => onChange(item.value)}
								/>
							)}
						/>
					</View>

					<View>
						<Text style={{ fontSize: theme.font_size_base, marginBottom: 8, fontWeight: '500' }}>
							Additional Message (Optional)
						</Text>
						<Controller
							control={control}
							name='message'
							render={({ field: { onChange, value } }) => (
								<Input
									placeholder='Add any additional details or notes...'
									multiline
									numberOfLines={4}
									textAlignVertical='top'
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
					</View>

					<View style={{ marginTop: 8 }}>
						<Button
							type='primary'
							loading={submitting}
							onPress={handleSubmit(onSubmit)}
						>
							Submit Request
						</Button>
					</View>

					<View style={{
						padding: 12,
						backgroundColor: theme.fill_body,
						borderRadius: 8
					}}>
						<Text style={{ fontSize: theme.font_size_caption, color: theme.color_text_caption }}>
							Your request will be reviewed by the administrative staff. You'll be notified once it's processed.
						</Text>
					</View>
				</Flex>
			</ScrollView>
		</>
	);
};

export default NewRequest;
