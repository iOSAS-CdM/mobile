import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import { KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';

import { useFonts } from 'expo-font';

import { Provider } from '@ant-design/react-native';

const Stack = createStackNavigator();

import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';

import theme from './styles/theme';
const main = () => {
	const [fontsLoaded] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf')
	});

	const defaultValue = Platform.OS === 'ios' ? 'padding' : 'height';
	const [keyboardShown, setKeyboardShown] = React.useState(false);
	const [keyboardHeight] = React.useState(new Animated.Value(0));
	React.useEffect(() => {
		if (!fontsLoaded) return;

		const showListener = Keyboard.addListener('keyboardDidShow', () => {
			Animated.timing(keyboardHeight, {
				toValue: 250,
				duration: 250,
				useNativeDriver: false
			}).start();
			setKeyboardShown(true);
		});
		const hideListener = Keyboard.addListener('keyboardDidHide', () => {
			Animated.timing(keyboardHeight, {
				toValue: 0,
				duration: 250,
				useNativeDriver: false
			}).start();
			setKeyboardShown(false);
		});

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, [defaultValue, fontsLoaded]);

	if (!fontsLoaded) return null;
	return (
		<KeyboardAvoidingView
			behavior={keyboardShown ? defaultValue : undefined}
			keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardHeight : 0} 
			style={{
				flex: 1,
				backgroundColor: theme.fill_body,
				paddingTop: statusBarHeight
			}}
		>
			<KeyboardShownContext.Provider value={{ keyboardShown, setKeyboardShown }}>
				<Provider theme={theme}>
					<StatusBar style='auto' translucent />
					<NavigationContainer ref={navigationRef}>
						<Stack.Navigator>
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
						</Stack.Navigator>
					</NavigationContainer>
				</Provider>
			</KeyboardShownContext.Provider>
		</KeyboardAvoidingView>
	);
};

export default main;
export const navigationRef = React.createRef();
export const KeyboardShownContext = React.createContext();