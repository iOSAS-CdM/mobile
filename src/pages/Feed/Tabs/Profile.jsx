import React from 'react';
import { ImageBackground, Image, TouchableOpacity, Platform } from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import { Flex, Icon, Toast, Tooltip } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';

import supabase from '../../../utils/supabase';
import authFetch from '../../../utils/authFetch';

import { navigationRef, API_Route } from '../../../main';

import theme from '../../../styles/theme';

import Cover from '../../../../assets/public/cover.png';
import ICS from '../../../../assets/public/institutes/ics.png';
import ITE from '../../../../assets/public/institutes/ite.jpg';
import IBE from '../../../../assets/public/institutes/ibe.jpg';

const Profile = () => {
	const { cache, updateCache } = useCache();
	const { setRefresh } = useRefresh();

	const [signingOut, setSigningOut] = React.useState(false);
	const [uploadingPicture, setUploadingPicture] = React.useState(false);

	const handleSignOut = async () => {
		setSigningOut(true);
		await supabase.auth.signOut();
		setSigningOut(false);
		navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
	};

	
	const fetchUser = async () => {
		const response = await authFetch(`${API_Route}/auth/me`, {
			signal: controller.signal
		}).catch((error) => {
			console.error('Error fetching user data:', error);
			fetchUser();
		});
		if (response?.status === 0) return;

		const data = await response.json();
		if (!data) {
			Toast.fail('Invalid user data received', 1);
			return;
		};
		updateCache('user', data);
	};

	const handleProfilePictureChange = async () => {
		try {
			// Request permissions
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				Toast.fail('Permission to access media library denied', 2);
				return;
			};

			// Launch image picker
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8
			});

			if (result.canceled || !result.assets || result.assets.length === 0) return;

			const asset = result.assets[0];
			const uri = asset.uri;

			setUploadingPicture(true);

			// Get the file info
			const name = asset.fileName || asset.name || uri.split('/').pop() || 'profile.jpg';
			const match = name.match(/\.(\w+)$/);
			const ext = match ? match[1] : 'jpg';
			const mime = asset.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;

			// Try using FileSystem.uploadAsync for better reliability
			try {
				const { data: { session } = {} } = await supabase.auth.getSession();
				const token = session?.access_token;
				const uploadUrl = `${API_Route.replace(/\/$/, '')}/users/profile-picture`;

				const uploadResult = await FileSystem.uploadAsync(uploadUrl, uri, {
					httpMethod: 'POST',
					uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					fieldName: 'profilePicture',
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {})
					}
				});

				if (!uploadResult || uploadResult.status < 200 || uploadResult.status >= 300) {
					console.error('Upload failed', uploadResult);
					Toast.fail('Failed to update profile picture', 2);
					setUploadingPicture(false);
					return;
				};

				// Parse response
				let data = null;
				try {
					data = JSON.parse(uploadResult.body || 'null');
				} catch (e) {
					console.error('Failed to parse response', e);
				};

				if (data && data.profilePicture) {
					Toast.success('Profile picture updated successfully', 2);
					fetchUser();
				} else {
					Toast.fail('Failed to update profile picture', 2);
				};
			} catch (uploadErr) {
				console.error('FileSystem.uploadAsync error', uploadErr);

				// Fallback to fetch with FormData
				const formData = new FormData();
				formData.append('profilePicture', {
					uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
					name,
					type: mime
				});

				const response = await authFetch(`${API_Route}/users/profile-picture?seed=${Date.now()}`, {
					method: 'POST',
					body: formData
				});

				if (response?.status === 0) {
					setUploadingPicture(false);
					return;
				};

				if (!response?.ok) {
					Toast.fail(`Failed to update profile picture: ${response?.statusText || 'Unknown'}`, 2);
					setUploadingPicture(false);
					return;
				};

				const data = await response.json().catch(() => null);
				if (data && data.profilePicture) {
					Toast.success('Profile picture updated successfully', 2);
					fetchUser();
				} else {
					Toast.fail('Failed to update profile picture', 2);
				};
			}
		} catch (error) {
			console.error('Error updating profile picture:', error);
			Toast.fail('Failed to update profile picture', 2);
		} finally {
			setUploadingPicture(false);
		};
	};

	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={false}
					onRefresh={async () => {
						setRefresh({
							key: 'user',
							callback: async () => {
								await supabase.auth.getUser();
							}
						});
					}}
				/>
			}
		>
			<Flex
				direction='column'
				align='start'
				justify='start'
				style={{ flex: 1, gap: theme.h_spacing_md }}
			>
				<Flex
					direction='column'
					align='start'
					justify='start'
					style={{ width: '100%' }}
				>
					<ImageBackground
						source={Cover}
						style={{
							position: 'relative',
							width: '100%',
							paddingHorizontal: theme.h_spacing_lg,
							paddingVertical: theme.v_spacing_lg,
							backgroundColor: theme.brand_primary,
							justifyContent: 'start',
							alignItems: 'start'
						}}
					>
						<TouchableOpacity
							onPress={handleProfilePictureChange}
							disabled={uploadingPicture}
							style={{ position: 'relative', width: 128, height: 128, zIndex: 2 }}
						>
							<Avatar
								size={128}
								source={{ uri: cache.user?.profilePicture + `?random=${Math.random()}` }}
								alt='User Avatar'
								style={{
									borderWidth: 4,
									borderColor: theme.fill_base,
									opacity: uploadingPicture ? 0.6 : 1
								}}
							/>
							<Icon
								name='camera'
								size={32}
								style={{
									position: 'absolute',
									bottom: 0,
									right: 0,
									backgroundColor: theme.fill_base,
									borderRadius: 12,
									padding: theme.h_spacing_sm
								}}
							/>
						</TouchableOpacity>

						{(() => {
							const size = 128 + (theme.v_spacing_lg * 2) * 4;
							return (
								<Image
									source={{
										ics: ICS,
										ite: ITE,
										ibe: IBE
									}[cache.user?.institute?.toLowerCase() || 'ics'] || ICS}
									style={{
										position: 'absolute',
										left: ((size / 2) / -2) + theme.h_spacing_lg,
										top: ((128 + (theme.v_spacing_lg * 2)) / 2) - (size / 2),
										width: size,
										height: size,
										borderRadius: 100000,
										zIndex: 1
									}}
								/>
							);
						})()}

						{cache.user?.role === 'unverified-student' && (
							<Text
								style={{
									position: 'absolute',
									top: 0,
									right: 0,
									paddingVertical: theme.v_spacing_sm,
									paddingHorizontal: theme.h_spacing_md,
									backgroundColor: theme.brand_warning,
									borderBottomLeftRadius: theme.radius_lg,
									fontSize: theme.font_size_icontext,
									color: theme.fill_base
								}}
							>
								Unverified Student
							</Text>
						)}
					</ImageBackground>
					<Flex
						direction='column'
						align='start'
						justify='center'
						style={{
							width: '100%',
							paddingHorizontal: theme.h_spacing_lg,
							paddingVertical: theme.v_spacing_lg,
							backgroundColor: theme.fill_base
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_heading,
								fontWeight: 'bold',
								color: theme.brand_primary
							}}
						>
							{`${cache.user?.name?.first || ''} ${cache.user?.name?.last || ''
								}`}
						</Text>
						<Text style={{ fontSize: theme.font_size_caption }}>
							{cache.user?.id || ''}
						</Text>
						<Flex
							direction='row'
							align='center'
							justify='start'
							gap={8}
						>
							<Icon name='mail' size={theme.font_size_base} />
							<Text>{cache.user?.email}</Text>
						</Flex>
					</Flex>
				</Flex>

				{cache.user?.role === 'student' && (
					<Flex
						direction='column'
						align='stretch'
						justify='start'
						style={{
							position: 'relative',
							width: '100%',
							padding: 16,
							gap: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Tooltip content='This QR code verifies your identity as a student. Show this to school authorities when requested.' crossOffset={{ top: 0 }}>
							<Icon name='info-circle' size={16} style={{ position: 'absolute', top: 8, right: 8 }} />
						</Tooltip>
						<Text style={{ fontWeight: 'bold', fontSize: theme.font_size_subhead, textAlign: 'center' }}>Verified Student</Text>
						<Image
							source={{ uri: `https://barcode.orcascan.com/?type=qrcode&data=${cache.user?.id}&fontsize=Fit&format=png&padding=0` }}
							style={{ width: 128, height: 128, alignSelf: 'center' }}
						/>
						<Text style={{ textAlign: 'center' }}>Since {moment(cache.user?.verifiedSince).format('MMMM DD YYYY')}</Text>
					</Flex>
				)}

				<Flex
					direction='column'
					align='stretch'
					justify='start'
					style={{
						width: '100%',
						padding: 16,
						gap: 16,
						backgroundColor: theme.fill_base
					}}
				>
					<Button type='primary' loading={signingOut} onPress={handleSignOut}>Sign Out</Button>
				</Flex>
			</Flex>
		</ScrollView>
	);
};

export default Profile;
