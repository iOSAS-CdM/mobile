import React from 'react';
import Constants from 'expo-constants';
import * as SystemUI from 'expo-system-ui';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import supabase from './utils/supabase';

import { Platform, KeyboardAvoidingView, Dimensions, LogBox, StatusBar } from 'react-native';

import { useFonts } from 'expo-font';

import { KeyboardProvider, useKeyboard } from './contexts/useKeyboard';
import { RefreshProvider } from './contexts/useRefresh';
import { WebSocketProvider } from './contexts/WebSocketContext';

import { Provider } from '@ant-design/react-native';

const Stack = createStackNavigator();

import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Recovery from './pages/Authentication/Recovery';
import Feed from './pages/Feed/Feed';

import NewCase from './pages/Feed/Tabs/cases/New';
import ViewCase from './pages/Feed/Tabs/cases/View';

import { CacheProvider } from './contexts/CacheContext';
const CachedFeed = (props) => (
	<CacheProvider>
		<Feed {...props} />
	</CacheProvider>
);

const height = Dimensions.get('window').height;

SystemUI.setBackgroundColorAsync('#ffffff');
SplashScreen.preventAutoHideAsync();

import theme from './styles/theme';
const Main = () => {
	const [session, setSession] = React.useState(null);
	const [sessionChecked, setSessionChecked] = React.useState(false);
	React.useEffect(() => {
		StatusBar.setBarStyle('dark-content');
		StatusBar.setBackgroundColor('#ffffff');

		// Check active session and set
		supabase.auth.getSession().then(({ data: { session }, error }) => {
			if (error) {
				console.error('Error getting session:', error);
				setSessionChecked(true);
				SplashScreen.hide();
				return;
			};
			setSession(session);
			setSessionChecked(true);
			SplashScreen.hide();
		});

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setSessionChecked(true);
			SplashScreen.hide();
		});

		return () => subscription.unsubscribe();
	}, []);

	const [fontsLoaded] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
		antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf')
	});

	const keyboardVisible = useKeyboard();

	if (!fontsLoaded || !sessionChecked) return null;

	LogBox.ignoreLogs(['AbortError']);

	if (!fontsLoaded || !sessionChecked) return null;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{
				flex: Platform.OS === 'ios' ? 0 : 1,
				height: height,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: theme.fill_base
			}}
			enabled={keyboardVisible}
		>
			<Provider theme={theme}>
				<StatusBar style='auto' translucent />
				<NavigationContainer ref={navigationRef}>
					<Stack.Navigator initialRouteName={session && session.access_token ? 'Feed' : 'SignIn'}>
						<Stack.Screen
							name='SignIn'
							component={SignIn}
							options={{
								headerShown: false,
								animation: 'slide_from_left'
							}}
						/>
						<Stack.Screen
							name='SignUp'
							component={SignUp}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='Recovery'
							component={Recovery}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>



						<Stack.Screen
							name='Feed'
							component={CachedFeed}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='NewCase'
							component={NewCase}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='ViewCase'
							component={ViewCase}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</Provider>
		</KeyboardAvoidingView>
	);
};

const Entry = (props) => {
	const wsProtocol = API_Route.startsWith('https') ? 'wss' : 'ws';
	const host = API_Route.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
	const url = `${wsProtocol}://${host}/`;

	return (
		<KeyboardProvider>
			<WebSocketProvider url={url}>
				<RefreshProvider>
					<Main {...props} />
				</RefreshProvider>
			</WebSocketProvider>
		</KeyboardProvider>
	);
};

export default Entry;
/**
 * @type {{
 * 	current: import('@react-navigation/native').NavigationContainerRef<any> | null
 * }}
 */
export const navigationRef = React.createRef();
export const API_Route = __DEV__ ? 'http://10.242.192.28:3001' : 'http://47.130.158.40/api';