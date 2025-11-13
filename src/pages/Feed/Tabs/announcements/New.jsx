import React from 'react';
import { ScrollView, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

const NewAnnouncement = ({ route }) => {
	const organization = route.params?.organization;
	const { pushToCache } = useCache();
	const { control, handleSubmit, setValue } = useForm({ defaultValues: { title: '', content: '', type: 'information', event_date: null } });

	const [coverPreview, setCoverPreview] = React.useState(null);
	const [coverAsset, setCoverAsset] = React.useState(null);
	const [submitting, setSubmitting] = React.useState(false);

	const pickImage = async () => {
		try {
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				Toast.fail('Permission to access media library denied', 2);
				return;
			}
			const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
			if (!result.cancelled) {
				setCoverPreview(result.uri);
				setCoverAsset(result);
			};
		} catch (e) {
			console.error('ImagePicker error', e);
			Toast.fail('Failed to pick image', 1);
		};
	};

	const onSubmit = async (values) => {
		if (!organization) return;
		setSubmitting(true);
		try {
			const formData = new FormData();
			formData.append('title', values.title);
			formData.append('content', values.content);
			formData.append('type', values.type || 'information');
			// attach organization id so backend can optionally handle it
			formData.append('organizationId', organization.id);

			if (values.type === 'event' && values.event_date) {
				const iso = values.event_date instanceof Date ? values.event_date.toISOString() : String(values.event_date);
				formData.append('event_date', iso);
			};

			if (coverAsset) {
				const uri = coverAsset.uri;
				const name = uri.split('/').pop();
				const match = name.match(/\.(\w+)$/);
				const ext = match ? match[1] : 'jpg';
				const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
				formData.append('cover', { uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri, name, type });
			} else {
				Toast.fail('Please select a cover image', 2);
				setSubmitting(false);
				return;
			};

			const response = await authFetch(`${API_Route}/announcements`, {
				method: 'POST',
				headers: { 'Content-Type': 'multipart/form-data' },
				body: formData
			});
			if (response?.status === 0) return;
			if (!response?.ok) {
				Toast.fail(`Failed to publish announcement: ${response?.statusText || 'Unknown'}`, 2);
				setSubmitting(false);
				return;
			};

			// On success, navigate back and refresh announcements cache
			const data = await response.json().catch(() => null);
			if (data) pushToCache('announcements', data, true);
			Toast.success('Announcement published', 2);
			navigationRef.current?.goBack();
		} catch (e) {
			console.error('Publish error', e);
			Toast.fail('Failed to publish announcement', 2);
		} finally {
			setSubmitting(false);
		};
	};

	return (
		<>
			<Flex direction='row' justify='space-between' align='center' style={{ width: '100%', padding: theme.v_spacing_md, borderBottomWidth: 0.25, borderBottomColor: theme.border_color_base, backgroundColor: theme.fill_base }}>
				<Button size='small' icon='left' onPress={() => navigationRef.current?.goBack()} />
				<Text style={{ fontSize: theme.font_size_subhead, fontWeight: '600' }}>Publish Announcement</Text>
				<View style={{ width: 40 }} />
			</Flex>

			<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
				<Flex direction='column' justify='center' align='stretch' gap={16} style={{ width: '100%', padding: 16, backgroundColor: theme.fill_base }}>
					<Controller control={control} name='title' rules={{ required: true }} render={({ field: { onChange, value } }) => (
						<Input placeholder='Title' value={value} onChangeText={onChange} />
					)} />

					<Controller control={control} name='content' rules={{ required: true }} render={({ field: { onChange, value } }) => (
						<Input placeholder='Content' multiline numberOfLines={4} textAlignVertical='top' value={value} onChangeText={onChange} />
					)} />

					<Controller control={control} name='type' render={({ field: { onChange, value } }) => (
						<Picker data={[{ label: 'Information', value: 'information' }, { label: 'Event', value: 'event' }]} labelField='label' valueField='value' value={value} onChange={(item) => onChange(item.value)} />
					)} />

					<View>
						<Button type='default' icon='camera' onPress={pickImage}>{coverPreview ? 'Change Cover' : 'Pick Cover Image'}</Button>
						{coverPreview && <Image source={{ uri: coverPreview }} style={{ width: '100%', height: 180, marginTop: 12, borderRadius: 8 }} />}
					</View>

					<Button type='primary' loading={submitting} onPress={handleSubmit(onSubmit)}>Publish</Button>
				</Flex>
			</ScrollView>
		</>
	);
};

export default NewAnnouncement;
