import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import { Flex, Icon } from '@ant-design/react-native';

import IconButton from '../../components/IconButton';

import Home from './Tabs/Home';
import Cases from './Tabs/Cases';
import Calendar from './Tabs/Calendar';
import Repository from './Tabs/Repository';
import Profile from './Tabs/Profile';
import AmBot from './Tabs/AmBot';
import Organizations from './Tabs/Organizations';

import { KeyboardShownContext } from '../../main';

import Logo from '../../../assets/public/Logo.png';

const Tab = createMaterialTopTabNavigator();

import { CacheProvider, useCache } from '../../contexts/CacheContext';

import theme from '../../styles/theme';
const Feed = () => {
	const { keyboardShown } = React.useContext(KeyboardShownContext);

	const { cache, updateCache, getCache } = useCache();

	/** @typedef {import('../../contexts/CacheContext').UserProps} UserProps */
	/** @type {[UserProps, React.Dispatch<React.SetStateAction<UserProps | Null>>]} */
	const [user, setUser] = React.useState(null);
	React.useEffect(() => {
		const user = getCache()['user'];
		if (user) return setUser(user);
		const fetchedUser = {
			role: 'student',
			studentId: '22-00250',
			name: {
				first: 'Danielle',
				last: 'Craig'
			},
			email: 'danielle.craig@gmail.com',
			institute: 'ics',
			program: 'BSIT',
			year: 3,
			phone: '+63 912 345 6789',
			profilePicture: 'https://i.pravatar.cc/256',
			status: 'active',
			organizations: []
		};
		updateCache('user', fetchedUser);
		setUser(fetchedUser);
	}, [cache.user]);

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Flex
					direction='row'
					justify='space-between'
					align='center'
					style={{
						paddingHorizontal: 16,
						backgroundColor: theme.fill_base
					}}
				>
					<Image
						source={Logo}
						style={{ width: 64, height: 32, objectFit: 'contain' }}
						contentFit='contain'
					/>
					<Flex direction='row' align='center' gap={8}>
						<IconButton size='small' name='search' />
						{user?.organizations?.length > 0 && (
							<IconButton size='small' name='qrcode' />
						)}
						<IconButton size='small' iconType='filled' name='info-circle' />
					</Flex>
				</Flex>
			</TouchableWithoutFeedback>

			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Tab.Navigator
					initialRouteName='Home'
					swipeEnabled={!keyboardShown}
					style={{
						position: 'relative',
						width: '100%',
						minHeight: '100%',
						padding: 0,
						backgroundColor: theme.fill_base
					}}
					screenOptions={{
						tabBarShowLabel: false,
						tabBarIndicatorStyle: {
							height: 2,
							backgroundColor: theme.brand_primary
						},
						tabBarStyle: {
							shadowOffset: {
								width: 0,
								height: 0
							},
							borderBottomWidth: 0.25,
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
						name='AmBot'
						component={AmBot}
						options={{
							tabBarIcon: ({ focused }) => (
								<Icon
									name='robot'
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
