import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Keyboard, TouchableWithoutFeedback, Image, Platform, Dimensions, ScrollView as RNScrollView, StyleSheet, View } from 'react-native';
import { Flex, Icon, Toast, Badge, ActivityIndicator, Modal, Tag } from '@ant-design/react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Polygon } from 'react-native-svg';
import dayjs from 'dayjs';

import IconButton from '../../components/IconButton';
import Text from '../../components/Text';
import Anchor from '../../components/Anchor';
import Button from '../../components/Button';

import Home from './Tabs/Home';
import Cases from './Tabs/Cases';
import Calendar from './Tabs/Calendar';
import Organizations from './Tabs/Organizations';
import Profile from './Tabs/Profile';

import { useKeyboard } from '../../contexts/useKeyboard';

import Logo from '../../../assets/public/logo.png';
import Sadbot from '../../../assets/public/sadbot.png';
import AppIcon from '../../../assets/icon.png';

import { useCache } from '../../contexts/CacheContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import authFetch from '../../utils/authFetch';
import supabase from '../../utils/supabase';

const Tab = createMaterialTopTabNavigator();

import { API_Route, navigationRef } from '../../main';

import theme from '../../styles/theme';

/** @typedef {{ key: keyof import('../../contexts/CacheContext').Cache, seed: number }} Refresh */
import { useRefresh } from '../../contexts/useRefresh';

/**
 * @type {React.FC<{
 * 	navigation: import('@react-navigation/native').NavigationProp<any, any>;
 * 	route: import('@react-navigation/native').RouteProp<any, any>;
 * }>}
 */
const Feed = ({ navigation, route }) => {
	const keyboardShown = useKeyboard();

	const { cache, updateCache } = useCache();
	const { refresh } = useRefresh();
	const { sendMessage } = useWebSocket();

	/** @typedef {import('../../contexts/CacheContext').UserProps} UserProps */
	/** @type {[UserProps, React.Dispatch<React.SetStateAction<UserProps | null>>]} */
	const [user, setUser] = React.useState(null);
	const [requestsModalVisible, setRequestsModalVisible] = React.useState(false);
	const [requests, setRequests] = React.useState([]);
	const [loadingRequests, setLoadingRequests] = React.useState(false);
	const [scannerModalVisible, setScannerModalVisible] = React.useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = React.useState(false);
	const [qrBounds, setQrBounds] = React.useState(null);

	React.useEffect(() => {
		const controller = new AbortController();

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
			setUser(data);
			sendMessage({ type: 'introduce', payload: { id: data.id } });
			tabNavigatorRef.current?.reset({ index: 0, routes: [{ name: 'Home' }] });
		};
		fetchUser();
		return () => controller.abort();
	}, [refresh, tabNavigatorRef]);

	const [organizations, setOrganizations] = React.useState([]);
	React.useEffect(() => {
		if (!user) return;

		const controller = new AbortController();

		const fetchOrganizations = async () => {
			const response = await authFetch(`${API_Route}/users/student/${user.id}/organizations`, {
				signal: controller.signal
			}).catch((error) => {
				console.error('Error fetching organizations:', error);
				Toast.fail('Network error. Please try again.', 1);
			});
			if (response?.status === 0) return;

			const data = await response.json();
			if (!data) {
				Toast.fail('Invalid organizations data received', 1);
				return;
			};
			setOrganizations(data.organizations || []);
			updateCache('organizations', data.organizations || []);
		};
		fetchOrganizations();
		return () => controller.abort();
	}, [refresh, user]);

	const fetchRequests = async () => {
		if (!user) return;

		setLoadingRequests(true);
		try {
			const response = await authFetch(`${API_Route}/requests`);
			if (response?.status === 0) return;

			const data = await response.json();
			if (!data) {
				Toast.fail('Failed to load requests', 1);
				return;
			};
			setRequests(data.requests || []);
			updateCache('requests', data.requests || []);
		} catch (error) {
			console.error('Error fetching requests:', error);
			Toast.fail('Network error. Please try again.', 1);
		} finally {
			setLoadingRequests(false);
		};
	};

	React.useEffect(() => {
		if (requestsModalVisible)
			fetchRequests();
	}, [requestsModalVisible, refresh]);

	if (!user) return (
		<Flex
			direction='column'
			justify='center'
			align='center'
			style={{ flex: 1, height: '100%', width: '100%', backgroundColor: theme.fill_base }}
		>
			<Image
				source={AppIcon}
				style={{ width: 128, height: 128, objectFit: 'contain' }}
				contentFit='contain'
			/>
			<ActivityIndicator size='large' style={{ marginTop: theme.v_spacing_lg }} />
		</Flex>
	);

	if (!['student', 'unverified-student'].includes(user?.role)) return (
		<Flex direction='column' justify='center' align='center' style={{ flex: 1 }}>
			<Flex direction='column' justify='center' align='center' style={{ padding: theme.v_spacing_lg, gap: theme.v_spacing_md }}>
				<Image
					source={Sadbot}
					style={{ width: 128, height: 128, objectFit: 'contain' }}
					contentFit='contain'
				/>
				<Text style={{ textAlign: 'center' }}>
					Your account is currently not permitted to access the app.
					If you believe this is an error, please contact support at{' '}
					<Anchor href='mailto:danieljohnbyns@gmail.com'>
						danieljohnbyns@gmail.com
					</Anchor>
				</Text>
				<Button
					type='primary'
					onPress={async () => {
						await supabase.auth.signOut();
						updateCache('user', null);
						setUser(null);
					}}
				>
					Sign Out
				</Button>
			</Flex>
		</Flex>
	);

	return (
		<>

			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Flex
					direction='row'
					justify='space-between'
					align='center'
					style={{
						height: Platform.OS === 'ios' ? 32 * 1.5 : 32,
						paddingHorizontal: 16,
						borderBottomWidth: Platform.OS === 'ios' ? 0.25 : 0,
						backgroundColor: theme.fill_base
					}}
				>
					<Image
						source={Logo}
						style={{ width: 64, height: 32, objectFit: 'contain' }}
						contentFit='contain'
					/>
					<Flex direction='row' align='center' gap={8}>
						{user?.role === 'student' && user?.organizations?.length > 0 && (
							<IconButton
								size='small'
								name='qrcode'
								onPress={() => setScannerModalVisible(true)}
							/>
						)}
						<IconButton
							size='small'
							name='paper-clip'
							onPress={() => setRequestsModalVisible(true)}
						/>
						{user?.role === 'student' && (
							<IconButton
								size='small'
								name='robot'
								onPress={() => navigationRef.current?.navigate('AmBot')}
							/>
						)}
						{user?.role === 'unverified-student' && (
							<Badge dot>
								<IconButton
									size='small'
									name='idcard'
									onPress={() => Modal.alert(
										'Account Unverified',
										(
											<Flex direction='column' gap={theme.v_spacing_md}>
												<Text>
													Everyone can sign up and use the app, whether you're inside or outside the school. To provide better identification and promote the Supreme Student Government's (SSG) initiatives, we've partnered with them to help identify users who are currently enrolled students at Colegio de Montalban. Account verification through SSG membership is <Text style={{ fontWeight: '600' }}>not required</Text> to use the app, and you can access most features without verification. However, to recognize those who support the SSG through their membership dues, verified students gain access to exclusive features including the ability to like and comment on announcements in the Feed, and access to AmBot, our AI assistant. To get verified, ensure your SSG membership is current—our team will verify your account based on SSG membership records. If you believe this is an error or need assistance, contact support at{' '}
													<Anchor href='mailto:danieljohnbyns@gmail.com'>
														danieljohnbyns@gmail.com
													</Anchor>
													.
												</Text>
											</Flex>
										),
										[{ text: 'OK', style: { color: theme.color_text_caption } }]
									)}
								/>
							</Badge>
						)}
					</Flex>
				</Flex>
			</TouchableWithoutFeedback>

			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Tab.Navigator
					ref={tabNavigatorRef}
					tabBarPosition={Platform.OS === 'ios' ? 'bottom' : 'top'}
					initialRouteName={route.params?.initialTab || 'Home'}
					swipeEnabled={!keyboardShown}
					style={{
						position: 'relative',
						width: '100%',
						padding: 0,
						backgroundColor: 'green'
					}}
					screenOptions={{
						tabBarShowLabel: false,
						tabBarIndicatorStyle: {
							height: 2,
							backgroundColor: theme.brand_primary,
							bottom: Platform.OS === 'ios' ? 'calc(100% - 1px)' : 0
						},
						tabBarStyle: {
							height: 32 * 1.5,
							shadowOffset: {
								width: 0,
								height: 0
							},
							borderTopWidth: Platform.OS === 'ios' ? 0.25 : 0,
							borderBottomWidth: Platform.OS === 'ios' ? 0 : 0.25,
							elevation: 0,
							zIndex: 0
						},
						swipeEnabled: !keyboardShown,
						lazy: false,
						animationEnabled: false
					}}
				>
					<Tab.Screen
						name='Home'
						component={Home}
						options={{
							tabBarIcon: ({ focused }) => (
								<Icon
									name='home'
									size={theme.icon_size_sm}
									color={
										focused
											? theme.brand_primary
											: theme.color_icon_base
									}
								/>
							)
						}}
					/>
					<Tab.Screen
						name='Cases'
						component={Cases}
						options={{
							tabBarIcon: ({ focused }) => (
								<Badge
									dot={cache.user?.ongoingCases > 0}
								>
									<Icon
										name='file-text'
										size={theme.icon_size_sm}
										color={
											focused
												? theme.brand_primary
												: theme.color_icon_base
										}
									/>
								</Badge>
							)
						}}
					/>
					<Tab.Screen
						name='Calendar'
						component={Calendar}
						options={{
							tabBarIcon: ({ focused }) => (
								<Icon
									name='calendar'
									size={theme.icon_size_sm}
									color={
										focused
											? theme.brand_primary
											: theme.color_icon_base
									}
								/>
							)
						}}
					/>
					{organizations?.length > 0 && (
						<Tab.Screen
							name='Organizations'
							component={Organizations}
							options={{
								tabBarIcon: ({ focused }) => (
									<Icon
										name='team'
										size={theme.icon_size_sm}
										color={
											focused
												? theme.brand_primary
												: theme.color_icon_base
										}
									/>
								)
							}}
						/>
					)}
					<Tab.Screen
						name='Profile'
						component={Profile}
						options={{
							tabBarIcon: ({ focused }) => (
								<Icon
									name='user'
									size={theme.icon_size_sm}
									color={
										focused
											? theme.brand_primary
											: theme.color_icon_base
									}
								/>
							)
						}}
					/>
				</Tab.Navigator>
			</TouchableWithoutFeedback>

			{/* Requests Modal */}
			<Modal
				visible={requestsModalVisible}
				transparent
				title='Your requests'
				animateAppear
				animationType='fade'
				onClose={() => setRequestsModalVisible(false)}
				style={{ padding: 0, backgroundColor: theme.fill_body, width: Dimensions.get('window').width - 32, borderRadius: 8 }}
				footer={[
					{ text: 'Close', onPress: () => setRequestsModalVisible(false), style: { color: theme.color_text_caption } },
					{
						text: 'Create', onPress: () => {
							setRequestsModalVisible(false);
							navigationRef.current?.navigate('NewRequest');
						}
					}
				]}
			>
				<RNScrollView style={{ maxHeight: 512, padding: theme.v_spacing_sm }}>
					<Flex direction='column' align='stretch'>
						{loadingRequests ? (
							<Flex justify='center' align='center' style={{ padding: 32 }}>
								<ActivityIndicator size='large' />
							</Flex>
						) : requests.length === 0 ? (
							<Flex direction='column' justify='center' align='center' style={{ padding: 32, gap: 8 }}>
								<Icon name='file-text' size={48} color={theme.color_icon_base} />
								<Text style={{ textAlign: 'center', color: theme.color_text_caption }}>
									No requests yet
								</Text>
								<Text style={{ textAlign: 'center', color: theme.color_text_caption, fontSize: theme.font_size_caption }}>
									Tap 'Create' to submit your first request
								</Text>
							</Flex>
						) : (
							requests.sort((a, b) => {
								if (a.status === 'open' && b.status !== 'open') return -1;
								if (b.status === 'open' && a.status !== 'open') return 1;
								return new Date(b.created_at) - new Date(a.created_at);
							}).map((request) => (
								<Flex
									key={request.id}
									direction='column'
									align='stretch'
									style={{
										width: '100%',
										padding: theme.v_spacing_sm,
										backgroundColor: request.status === 'open' ? theme.fill_base : theme.fill_background,
										opacity: request.status === 'open' ? 1 : 0.5,
										gap: theme.v_spacing_sm,
										...request.status === 'rejected' ? {
											borderLeftWidth: 3,
											borderLeftColor: theme.brand_error
										} : request.status === 'accepted' ? {
											borderLeftWidth: 3,
											borderLeftColor: theme.brand_success
										} : {}
									}}
									onPress={() => {
										setRequestsModalVisible(false);
										navigationRef.current?.navigate('ViewRequest', { requestData: request });
									}}
								>
									<Flex direction='row' align='start' justify='between'>
										<Flex direction='column' align='start' style={{ flex: 1 }}>
											<Text
												style={{
													fontSize: theme.font_size_base,
													fontWeight: '600'
												}}
											>
												{request.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
											</Text>
											{request.message && (
												<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_text_secondary }}>
													{request.message}
												</Text>
											)}
										</Flex>
										<Flex direction='column' align='end' justify='center' style={{ gap: theme.v_spacing_sm }}>
											<Tag small selected>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Tag>
											<Text style={{ fontSize: theme.font_size_base, color: theme.color_icon_base }}>
												{new Date(request.created_at).toLocaleDateString()}
											</Text>
										</Flex>
									</Flex>
									{request.response && (
										<Flex direction='column' align='stretch'>
											<Text style={{ fontSize: theme.font_size_icontext, fontWeight: '600', color: request.status === 'accepted' ? theme.brand_success : theme.brand_error }}>
												Staff Response
											</Text>
											<Text style={{ fontSize: theme.font_size_caption_sm, color: theme.color_text_secondary }}>
												{request.response}
											</Text>
										</Flex>
									)}
								</Flex>
							))
						)}
					</Flex>
				</RNScrollView>
			</Modal>

			{/* Scanner Modal */}
			{user?.role === 'student' && user?.organizations?.length > 0 && (
				<Modal
					visible={scannerModalVisible}
					transparent
					title='QR Code Scanner'
					animateAppear
					animationType='fade'
					onClose={() => {
						setScannerModalVisible(false);
						setScanned(false);
						setQrBounds(null);
					}}
					style={{ padding: 0, backgroundColor: theme.fill_body, width: Dimensions.get('window').width - 32, borderRadius: 8, overflow: 'hidden' }}
					footer={[
						{
							text: 'Close', onPress: () => {
								setScannerModalVisible(false);
								setScanned(false);
								setQrBounds(null);
							}, style: { color: theme.color_text_caption }
						}
					]}
				>
					{!permission ? (
						<Flex justify='center' align='center' style={{ padding: 32 }}>
							<ActivityIndicator size='large' />
						</Flex>
					) : !permission.granted ? (
						<Flex direction='column' justify='center' align='center' style={{ padding: 32, gap: theme.v_spacing_md }}>
							<Icon name='camera' size={48} color={theme.color_icon_base} />
							<Text style={{ textAlign: 'center' }}>
								Camera permission is required to scan QR codes
							</Text>
							<Button type='primary' onPress={requestPermission}>
								Grant Permission
							</Button>
						</Flex>
					) : (
						<View style={{ width: '100%', aspectRatio: 1, overflow: 'hidden', borderRadius: 8 }}>
							<CameraView
								style={StyleSheet.absoluteFillObject}
								facing='back'
								barcodeScannerSettings={{
									barcodeTypes: ['qr']
								}}
								onBarcodeScanned={scanned ? undefined : async ({ data, cornerPoints }) => {
									setScanned(true);
									if (cornerPoints)
										setQrBounds(cornerPoints);

									const response = await authFetch(`${API_Route}/users/student/${data}/verify`);
									setScanned(false);
									setQrBounds(null);

									if (!response?.ok) return;

									// Check for verifiedSince
									const result = await response.json();
									if (result.verifiedSince)
										Toast.success(`User ${data} is verified\nsince ${dayjs(result.verifiedSince).format('MMMM D, YYYY')}`, 2);
									else
										Toast.fail(`User ${data} is not verified`, 2);
								}}
							/>
							<View style={{
								...StyleSheet.absoluteFillObject,
								justifyContent: 'center',
								alignItems: 'center'
							}}>
								<View style={{
									width: 256,
									height: 256,
									borderWidth: 2,
									borderColor: 'white',
									borderRadius: theme.border_width_lg,
									backgroundColor: 'transparent'
								}} />
							</View>
							{qrBounds && (
								<Svg style={StyleSheet.absoluteFillObject}>
									<Polygon
										points={qrBounds.map(point => `${point.x},${point.y}`).join(' ')}
										fill='rgba(0, 0, 0, 0)'
										stroke={theme.brand_primary}
										strokeWidth='1'
									/>
								</Svg>
							)}
						</View>
					)}
				</Modal>
			)}
		</>
	);
};

/**
 * @type {React.RefObject<import('@react-navigation/native').NavigationContainerRef | null>}
 */
export const tabNavigatorRef = React.createRef();
export default Feed;
