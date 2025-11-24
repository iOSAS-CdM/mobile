import React from 'react';
import Constants from 'expo-constants';
import * as SystemUI from 'expo-system-ui';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import supabase from './utils/supabase';
import * as Updates from 'expo-updates';

import { Platform, KeyboardAvoidingView, Dimensions, LogBox, StatusBar, AppState } from 'react-native';

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
import ViewOrganization from './pages/Feed/Tabs/organizations/View';
import NewAnnouncement from './pages/Feed/Tabs/announcements/New';
import NewRequest from './pages/Feed/Tabs/requests/New';
import ViewRequest from './pages/Feed/Tabs/requests/View';

import AmBot from './pages/Feed/AmBot';

import { CacheProvider } from './contexts/CacheContext';

const height = Dimensions.get('window').height;

SystemUI.setBackgroundColorAsync('#ffffff');
SplashScreen.preventAutoHideAsync();

import { setupPushNotifications, unregisterPushToken } from './utils/notifications';
import * as Notifications from 'expo-notifications';

import theme from './styles/theme';
const Main = () => {
	const [session, setSession] = React.useState(null);
	const [sessionChecked, setSessionChecked] = React.useState(false);

	// Notification listeners
	const notificationListener = React.useRef();
	const responseListener = React.useRef();

	// Function to check for updates
	const checkForUpdates = React.useCallback(async () => {
		if (__DEV__) return; // Skip in development

		try {
			console.log('Checking for updates...');
			const update = await Updates.checkForUpdateAsync();
			if (update.isAvailable) {
				console.log('Update available, fetching...');
				await Updates.fetchUpdateAsync();
				Modal.alert('Update Available', 'A new version is available. Restart the app to apply the latest updates.', [
					{
						text: 'Restart Now',
						onPress: async () => {
							await Updates.reloadAsync();
						}
					},
					{
						text: 'Later',
						style: { color: theme.color_text_caption }
					}
				]);
			} else {
				console.log('No updates available');
			};
		} catch (e) {
			console.log('Update check failed:', e);
		};
	}, []);

	React.useEffect(() => {
		StatusBar.setBarStyle('dark-content');
		StatusBar.setBackgroundColor('#ffffff');

		// Run startup work inside an async IIFE with robust error handling so
		// an exception won't crash the app on startup.
		let subscription = null;
		let appStateSubscription = null;

		(async () => {
			// Check for updates on app launch
			await checkForUpdates();

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
				const res = supabase.auth.onAuthStateChange(async (event, newSession) => {
					setSession(newSession);
					setSessionChecked(true);
					try { SplashScreen.hide(); } catch (e) { /* ignore */ }

					// Handle navigation based on auth events
					if (event === 'SIGNED_IN' && newSession) {
						// Set up push notifications after sign in
						try {
							const token = await setupPushNotifications(newSession.access_token);
							if (token)
								console.log('Push notifications set up successfully');
						} catch (err) {
							console.error('Error setting up push notifications:', err);
						};

						// Navigate to Feed when user signs in
						setTimeout(() => {
							navigationRef.current?.reset({
								index: 0,
								routes: [{ name: 'Feed' }]
							});
						}, 100);
					} else if (event === 'SIGNED_OUT') {
						// Unregister push token on sign out
						if (newSession?.access_token) {
							try {
								await unregisterPushToken(newSession.access_token);
							} catch (err) {
								console.error('Error unregistering push token:', err);
							};
						};

						// Navigate to SignIn when user signs out
						setTimeout(() => {
							navigationRef.current?.reset({
								index: 0,
								routes: [{ name: 'SignIn' }]
							});
						}, 100);
					};
				});
				subscription = res?.data?.subscription ?? null;
			} catch (err) {
				console.error('Error subscribing to auth changes:', err);
			};
		})();

		// Set up AppState listener to check for updates when app comes to foreground
		if (!__DEV__) {
			appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
				if (nextAppState === 'active') {
					// Check for updates when app becomes active
					checkForUpdates();
				}
			});
		};

		// Set up notification listeners
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
			console.log('Notification received in foreground:', notification);
			// You can show a custom UI here or use Modal.alert
		});

		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			console.log('Notification tapped:', response);
			const data = response.notification.request.content.data;

			// Handle navigation based on notification data
			if (data?.screen)
				navigationRef.current?.navigate(data.screen, data.params || {});
		});

		return () => {
			try {
				if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
			} catch (err) {
				console.warn('Failed to unsubscribe auth subscription:', err);
			};

			// Clean up notification listeners
			if (notificationListener.current)
				Notifications.removeNotificationSubscription(notificationListener.current);
			if (responseListener.current)
				Notifications.removeNotificationSubscription(responseListener.current);

			// Clean up AppState listener
			if (appStateSubscription)
				appStateSubscription.remove();
		};
	}, [checkForUpdates]);

	const [fontsLoaded] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
		antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf')
	});

	const keyboardVisible = useKeyboard();

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
				<NavigationContainer
					ref={navigationRef}
					linking={{
						prefixes: ['com.danieljohnbyns.iosas://', 'exp://', 'https://'],
						config: {
							screens: {
								'oauth-callback': '*'
							}
						}
					}}
				>
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
						<Stack.Screen
							name='NewOrgAnnouncement'
							component={NewAnnouncement}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='ViewOrganization'
							component={ViewOrganization}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='AmBot'
							component={AmBot}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='NewRequest'
							component={NewRequest}
							options={{
								headerShown: false,
								animation: 'slide_from_right'
							}}
						/>
						<Stack.Screen
							name='ViewRequest'
							component={ViewRequest}
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
export const API_Route = __DEV__ ? 'http://10.242.192.28:3001' : 'https://api.iosas.online';