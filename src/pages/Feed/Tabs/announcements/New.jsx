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
import * as FileSystem from 'expo-file-system';
import supabase from '../../../../utils/supabase';
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
			};
			const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
			// Newer expo-image-picker returns { canceled, assets: [{ uri, fileName, type, ...}] }
			if (result && result.assets && result.assets.length > 0) {
				const asset = result.assets[0];
				setCoverPreview(asset.uri || null);
				setCoverAsset(asset);
				return;
			};
			// Fallback for older API shape
			if (result && (result.uri || result.cancelled === false || result.canceled === false)) {
				const uri = result.uri;
				setCoverPreview(uri || null);
				setCoverAsset({ uri });
			}
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
			formData.append('organization', organization.id);

			if (values.type === 'event' && values.event_date) {
				const iso = values.event_date instanceof Date ? values.event_date.toISOString() : String(values.event_date);
				formData.append('event_date', iso);
			};

			if (coverAsset) {
				// coverAsset may already be the single asset (with uri/fileName/type)
				const asset = coverAsset.assets ? coverAsset.assets[0] : coverAsset;
				const uri = asset.uri;
				const name = asset.fileName || asset.name || (uri ? uri.split('/').pop() : `photo.jpg`);
				const match = (name || '').match(/\.(\w+)$/);
				const ext = match ? match[1] : 'jpg';
				const mime = asset.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
				formData.append('cover', { uri: Platform.OS === 'ios' ? uri?.replace('file://', '') : uri, name, type: mime });
			} else {
				Toast.fail('Please select a cover image', 2);
				setSubmitting(false);
				return;
			};

			// Try using expo-file-system multipart upload which is more reliable for local file URIs
			try {
				const { data: { session } = {} } = await supabase.auth.getSession();
				const token = session?.access_token;
				const fileUri = (coverAsset.assets ? coverAsset.assets[0] : coverAsset).uri;
				const uploadUrl = `${API_Route.replace(/\/$/, '')}/announcements`;
				const params = {
					title: values.title || '',
					content: values.content || '',
					type: values.type || 'information',
					organization: organization.id
				};
				if (values.type === 'event' && values.event_date) params.event_date = values.event_date instanceof Date ? values.event_date.toISOString() : String(values.event_date);

				const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
					httpMethod: 'POST',
					uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					fieldName: 'cover',
					parameters: params,
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {})
					}
				});

				if (!uploadResult || uploadResult.status < 200 || uploadResult.status >= 300) {
					console.error('Upload failed', uploadResult);
					Toast.fail('Failed to publish announcement (upload failed)', 2);
					setSubmitting(false);
					return;
				}

				// server returns JSON in body
				let data = null;
				try { data = JSON.parse(uploadResult.body || 'null'); } catch (e) { /* ignore */ }
				if (data) pushToCache('announcements', data, true);
				Toast.success('Announcement published', 2);
				navigationRef.current?.goBack();
				setSubmitting(false);
				return;
			} catch (uploadErr) {
				console.error('FileSystem.uploadAsync error', uploadErr);
				// fallthrough to fetch fallback below
			};

			// Fallback to fetch with FormData if uploadAsync isn't available or fails
			console.log(`${API_Route}/announcements`);
			const response = await authFetch(`${API_Route}/announcements`, {
				method: 'POST',
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
