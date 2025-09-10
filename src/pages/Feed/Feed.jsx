import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Keyboard, TouchableWithoutFeedback, Image, Platform } from 'react-native';
import { Flex, Icon, Toast } from '@ant-design/react-native';

import IconButton from '../../components/IconButton';

import Home from './Tabs/Home';
import Cases from './Tabs/Cases';
import Calendar from './Tabs/Calendar';
import Repository from './Tabs/Repository';
import Organizations from './Tabs/Organizations';
import Profile from './Tabs/Profile';
import Menu from './Tabs/Menu';

import { KeyboardShownContext } from '../../main';

import Logo from '../../../assets/public/logo.png';

import { useCache } from '../../contexts/CacheContext';
import authFetch from '../../utils/authFetch';

const Tab = createMaterialTopTabNavigator();

import { API_Route } from '../../main';

import theme from '../../styles/theme';
const Feed = () => {
	const { keyboardShown } = React.useContext(KeyboardShownContext);

	const { cache, updateCache, getCache } = useCache();

	/** @typedef {import('../../contexts/CacheContext').UserProps} UserProps */
	/** @type {[UserProps, React.Dispatch<React.SetStateAction<UserProps | null>>]} */
	const [user, setUser] = React.useState(null);
	React.useEffect(() => {
		if (getCache()['user']) return setUser(user);

		const controller = new AbortController();
		const fetchUser = async () => {
			const request = await authFetch(`${API_Route}/auth/me`, {
				signal: controller.signal
			}).catch((error) => {
				console.error('Error fetching user data:', error);
				Toast.fail('Network error. Please try again.', 1);
			});
			const data = await request.json();
			if (!data) {
				Toast.fail('Invalid user data received', 1);
				return;
			};
			updateCache('user', data);
			setUser(data);
		};
		fetchUser();
		return () => { controller.abort(); };
	}, [cache]);

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
							<IconButton size='small' name='qrcode' />
						)}
						{['head', 'guidance', 'prefect', 'student-affairs'].includes(user?.role) && (
							<IconButton size='small' name='camera' />
						)}
						<IconButton size='small' name='robot' />
					</Flex>
				</Flex>
			</TouchableWithoutFeedback>

			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Tab.Navigator
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
						}
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
					{user?.role === 'student' || user?.role === 'unverified-student' && (
						<Tab.Screen
							name='Cases'
							component={Cases}
							options={{
								tabBarIcon: ({ focused }) => (
									<Icon
										name='file-text'
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
					<Tab.Screen
						name='Repository'
						component={Repository}
						options={{
							tabBarIcon: ({ focused }) => (
								<Icon
									name='folder'
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
					{user?.organizations?.length > 0 && (
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
					<Tab.Screen
						name='Menu'
						component={Menu}
						options={{
							tabBarIcon: ({ focused }) => (
								<Icon
									name='menu'
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
