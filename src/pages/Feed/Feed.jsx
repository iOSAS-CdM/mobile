import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import { Flex, Icon } from '@ant-design/react-native';

import Button from '../../components/Button';

import Home from './Tabs/Home';
import Cases from './Tabs/Cases';
import Calendar from './Tabs/Calendar';
import Repository from './Tabs/Repository';
import Profile from './Tabs/Profile';
import AmBot from './Tabs/AmBot';

import { KeyboardShownContext } from '../../main';

import Logo from '../../../assets/public/Logo.png';

const Tab = createMaterialTopTabNavigator();

import theme from '../../styles/theme';
const Feed = () => {
	const { keyboardShown } = React.useContext(KeyboardShownContext);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<Flex
				direction='column'
				justify='flex-start'
				align='stretch'
				style={{
					position: 'relative',
					width: '100%',
					minHeight: '100%',
					padding: 0,
					backgroundColor: theme.fill_base
				}}
			>
				<Flex
					direction='row'
					justify='space-between'
					align='center'
					style={{ paddingHorizontal: 16 }}
				>
					<Image
						source={Logo}
						style={{ width: 64, height: 32, objectFit: 'contain' }}
						contentFit='contain'
					/>
					<Flex direction='row' align='center' gap={4}>
						<Button type='default' size='small' icon='search' outlined={false} />
						<Button type='default' size='small' icon='info-circle' outlined={false} />
					</Flex>
				</Flex>
				<Tab.Navigator
					initialRouteName='Home'
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
							elevation: 0,
							zIndex: 0
						}
					}}
				>
					<Tab.Screen
						name='Home'
						component={Home}
						options={{
							tabBarIcon: ({ focused }) => <Icon name='home' color={focused ? theme.brand_primary : 'gray'} />
						}}
					/>
					<Tab.Screen
						name='Cases'
						component={Cases}
						options={{
							tabBarIcon: ({ focused }) => <Icon name='file-text' color={focused ? theme.brand_primary : 'gray'} />
						}}
					/>
					<Tab.Screen
						name='Calendar'
						component={Calendar}
						options={{
							tabBarIcon: ({ focused }) => <Icon name='calendar' color={focused ? theme.brand_primary : 'gray'} />
						}}
					/>
					<Tab.Screen
						name='Repository'
						component={Repository}
						options={{
							tabBarIcon: ({ focused }) => <Icon name='folder' color={focused ? theme.brand_primary : 'gray'} />
						}}
					/>
					<Tab.Screen
						name='Profile'
						component={Profile}
						options={{
							tabBarIcon: ({ focused }) => <Icon name='user' color={focused ? theme.brand_primary : 'gray'} />
						}}
					/>
					<Tab.Screen
						name='AmBot'
						component={AmBot}
						options={{
							tabBarIcon: ({ focused }) => <Icon name='robot' color={focused ? theme.brand_primary : 'gray'} />
						}}
					/>
				</Tab.Navigator>
			</Flex>
		</TouchableWithoutFeedback>
	);
};

export default Feed;
