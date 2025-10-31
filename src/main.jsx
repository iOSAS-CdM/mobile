import React from 'react';
import Constants from 'expo-constants';
import * as SystemUI from 'expo-system-ui';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import supabase from './utils/supabase';
import * as Updates from 'expo-updates';

import { Platform, KeyboardAvoidingView, Dimensions, LogBox, StatusBar } from 'react-native';

import { useFonts } from 'expo-font';

import { KeyboardProvider, useKeyboard } from './contexts/useKeyboard';
import { RefreshProvider } from './contexts/useRefresh';
import { WebSocketProvider } from './contexts/WebSocketContext';

import { Provider, Modal } from '@ant-design/react-native';

const Stack = createStackNavigator();

import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Recovery from './pages/Authentication/Recovery';
import Feed from './pages/Feed/Feed';

import NewCase from './pages/Feed/Tabs/cases/New';
import ViewCase from './pages/Feed/Tabs/cases/View';
import ViewRecord from './pages/Feed/Tabs/records/View';

import ViewAnnouncement from './pages/Feed/Tabs/announcements/View';

import { CacheProvider } from './contexts/CacheContext';

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

		// Run startup work inside an async IIFE with robust error handling so
		// an exception won't crash the app on startup.
		let subscription = null;
		(async () => {
			(async () => {
			try {
					const update = await Updates.checkForUpdateAsync();
					if (update.isAvailable) {
						await Updates.fetchUpdateAsync();
						Modal.alert('Update Available', 'Restarting the app to apply the latest updates.', [
							{
								text: 'OK',
								onPress: async () => {
									await Updates.reloadAsync();
								}
							}
						]);
					};
				} catch (e) {
					console.log('Update check failed:', e);
				};
			})();

			try {
				const { data: { session: currentSession }, error } = await supabase.auth.getSession();
				if (error)
					console.error('Error getting session:', error);
				else
					setSession(currentSession);
			} catch (err) {
				console.error('Exception while getting session:', err);
			};

			setSessionChecked(true);
			try {
				await SplashScreen.hideAsync();
			} catch (err) {
				console.warn('SplashScreen.hide failed:', err);
			};

			try {
				const res = supabase.auth.onAuthStateChange((_event, newSession) => {
					setSession(newSession);
					setSessionChecked(true);
					try { SplashScreen.hide(); } catch (e) { /* ignore */ }
				});
				subscription = res?.data?.subscription ?? null;
			} catch (err) {
				console.error('Error subscribing to auth changes:', err);
			};
		})();

		return () => {
			try {
				if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
			} catch (err) {
				console.warn('Failed to unsubscribe auth subscription:', err);
			};
		};
	}, []);

	const [fontsLoaded] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
		antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf')
	});

	const keyboardVisible = useKeyboard();

	if (!fontsLoaded || !sessionChecked) return null;

	LogBox.ignoreAllLogs(true);

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
							component={Feed}
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
						<Stack.Screen
							name='ViewRecord'
							component={ViewRecord}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>

						<Stack.Screen
							name='ViewAnnouncement'
							component={ViewAnnouncement}
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
	// Build a conservative websocket URL: strip any trailing `/api` path
	// because API HTTP endpoints commonly live under `/api` while the
	// websocket endpoint usually sits on the root or a different path.
	const apiRoute = (API_Route || '').toString();
	const wsProtocol = apiRoute.startsWith('https') ? 'wss' : 'ws';
	// remove protocol and trailing slashes, then remove a trailing '/api'
	const host = apiRoute.replace(/^https?:\/\//i, '').replace(/\/+$/, '').replace(/\/api$/i, '');
	const url = `${wsProtocol}://${host}`;

	return (
		<KeyboardProvider>
			<WebSocketProvider url={url}>
				<RefreshProvider>
					<CacheProvider>
						<Main {...props} />
					</CacheProvider>
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
export const API_Route = __DEV__ ? 'http://10.242.192.28:3001' : 'https://iosas.online/api';