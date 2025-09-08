import React from 'react';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;
import supabase from './utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafeAreaView, Platform, Keyboard, Dimensions } from 'react-native';

import { useFonts } from 'expo-font';

import { Provider } from '@ant-design/react-native';

const Stack = createStackNavigator();

import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Recovery from './pages/Authentication/Recovery';
import Feed from './pages/Feed/Feed';

import { CacheProvider } from './contexts/CacheContext';
const CachedFeed = (props) => (
	<CacheProvider>
		<Feed {...props} />
	</CacheProvider>
);

const height = Dimensions.get('window').height;

SystemUI.setBackgroundColorAsync('#ffffff');

import theme from './styles/theme';
const main = () => {
	const [fontsLoaded, error] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
		antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf')
	});
	if (error) {
		console.error('Error loading fonts', error);
	};

	const [keyboardShown, setKeyboardShown] = React.useState(false);
	const [keyboardHeight, setKeyboardHeight] = React.useState(0);
	React.useLayoutEffect(() => {
		if (!fontsLoaded) return;
		const showListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
			setKeyboardHeight(event.endCoordinates.height);
			setKeyboardShown(true);
		});
		const hideListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
			setKeyboardHeight(0);
			setKeyboardShown(false);
		});

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, [fontsLoaded]);

	/** @type {[import('@supabase/supabase-js').Session, React.Dispatch<React.SetStateAction<import('@supabase/supabase-js').Session | Null>>]} */
	const [session, setSession] = React.useState(null);
	const [sessionChecked, setSessionChecked] = React.useState(false);
	React.useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setSessionChecked(true);
		});
		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setSessionChecked(true);
		});
	}, []);


	// Modify `fetch`
	React.useLayoutEffect(() => {
		const modifyFetch = async () => {
			const originalFetch = window.fetch;

			window.fetch = async (...args) => {
				// Only add headers if we have a session with access token
				if (session?.access_token) {
					// First arg is the resource/URL, second arg is options
					if (args[1] && typeof args[1] === 'object') {
						// If headers already exist, add to them
						args[1].headers = {
							...args[1].headers,
							'Authorization': `Bearer ${session.access_token}`
						};
					} else {
						// Create headers object if options doesn't exist
						args[1] = {
							...(args[1] || {}),
							headers: {
								'Authorization': `Bearer ${session.access_token}`
							}
						};
					};
				};

				const response = await originalFetch(...args);

				// If we have a session but get a 403 Forbidden response, sign out
				if (session && response.status === 403) {
					await supabase.auth.signOut();
					window.location.href = '/unauthorized';
				};
				return response;
			};

			return () => {
				window.fetch = originalFetch;
			};
		};
		modifyFetch();
	}, [session, sessionChecked]);

	if (!fontsLoaded || !sessionChecked) return null;
	return (
		<SafeAreaView
			style={{
				flex: Platform.OS === 'ios' ? 0 : 1,
				height: Platform.OS === 'ios' ? height - keyboardHeight : null,
				paddingTop: statusBarHeight,
				paddingBottom: Platform.OS === 'ios' ? 0 : keyboardHeight,
				backgroundColor: theme.fill_base
			}}
		>
			<KeyboardShownContext.Provider value={{ keyboardShown, setKeyboardShown }}>
				<Provider theme={theme}>
					<StatusBar style='auto' translucent />
					<NavigationContainer ref={navigationRef}>
						<Stack.Navigator initialRouteName={session && session.user ? 'Feed' : 'SignIn'}>
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
						</Stack.Navigator>
					</NavigationContainer>
				</Provider>
			</KeyboardShownContext.Provider>
		</SafeAreaView>
	);
};

export default main;
export const navigationRef = React.createRef();
export const KeyboardShownContext = React.createContext();
export const API_Route = __DEV__ ? 'http://10.242.192.28:3001' : 'http://47.130.158.40';