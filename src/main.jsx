import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';

import { Provider } from '@ant-design/react-native';

import Authentication from './pages/Authentication';

const RootStack = createNativeStackNavigator({
	screens: {
		Authentication: {
			screen: Authentication,
			options: { headerShown: false }
		}
	}
});

const Navigation = createStaticNavigation(RootStack);

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
			<Navigation />
		</Provider>
	);
};

export default main;
