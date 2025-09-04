import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import { KeyboardAvoidingView, Platform, Keyboard, Dimensions, StatusBar } from 'react-native';

import { useFonts } from 'expo-font';

import { Provider } from '@ant-design/react-native';

const Stack = createStackNavigator();

import SignIn from './pages/Authentication/SignIn';

import theme from './styles/theme';
const main = () => {
	const [fontsLoaded] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf')
	});

	const defaultValue = Platform.OS === 'ios' ? 'padding' : 'height';
	const [behaviour, setBehaviour] = React.useState(defaultValue);
	React.useEffect(() => {
		if (!fontsLoaded) return;

		const showListener = Keyboard.addListener('keyboardDidShow', () => setBehaviour(defaultValue));
		const hideListener = Keyboard.addListener('keyboardDidHide', () => setBehaviour(undefined));

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, [defaultValue, fontsLoaded]);

	if (!fontsLoaded) return null;
	return (
		<KeyboardAvoidingView
			behavior={behaviour}
			style={{
				flex: 1,
				backgroundColor: theme.fill_body,
				paddingTop: statusBarHeight
			}}
		>
			<Provider theme={theme}>
				<NavigationContainer>
					<Stack.Navigator>
						<Stack.Screen
							name='SignIn'
							component={SignIn}
							options={{ headerShown: false }}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</Provider>
		</KeyboardAvoidingView>
	);
};

export default main;
