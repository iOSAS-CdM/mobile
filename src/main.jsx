import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useFonts } from 'expo-font';

import { Provider } from '@ant-design/react-native';

const Stack = createStackNavigator();

import SignIn from './pages/Authentication/SignIn';

import theme from './styles/theme';
const main = () => {
	const [fontsLoaded] = useFonts({
		antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf')
	});
	if (!fontsLoaded) return null;

	return (
		<Provider
			theme={theme}
		>
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
	);
};

export default main;
