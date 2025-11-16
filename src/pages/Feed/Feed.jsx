import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Keyboard, TouchableWithoutFeedback, Image, Platform } from 'react-native';
import { Flex, Icon, Toast, Badge, ActivityIndicator } from '@ant-design/react-native';

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
import { WebSocketProvider, useWebSocket } from '../../contexts/WebSocketContext';
import authFetch from '../../utils/authFetch';
import supabase from '../../utils/supabase';

const Tab = createMaterialTopTabNavigator();

import { API_Route, navigationRef } from '../../main';

import theme from '../../styles/theme';

/** @typedef {{ key: keyof import('../../contexts/CacheContext').Cache, seed: number }} Refresh */
import { useRefresh } from '../../contexts/useRefresh';


const Feed = () => {
	const keyboardShown = useKeyboard();

	const { cache, updateCache } = useCache();
	const { refresh, setRefresh } = useRefresh();
	const { sendMessage } = useWebSocket();
	/** @type {React.RefObject<import('@react-navigation/native').NavigationContainerRef | null>} */
	const tabNavigatorRef = React.useRef(null);

	/** @typedef {import('../../contexts/CacheContext').UserProps} UserProps */
	/** @type {[UserProps, React.Dispatch<React.SetStateAction<UserProps | null>>]} */
	const [user, setUser] = React.useState(null);
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
						navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
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
					{/* <Flex direction='row' align='center' gap={8}>
						{user?.role === 'student' && user?.organizations?.length > 0 && (
							<IconButton size='small' name='qrcode' />
						)}
						{['head', 'guidance', 'prefect', 'student-affairs'].includes(user?.role) && (
							<IconButton size='small' name='camera' />
						)}
						<IconButton size='small' name='robot' />
					</Flex> */}
				</Flex>
			</TouchableWithoutFeedback>

			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Tab.Navigator
					ref={tabNavigatorRef}
					tabBarPosition={Platform.OS === 'ios' ? 'bottom' : 'top'}
					initialRouteName='Home'
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
		</>
	);
};

export default Feed;
