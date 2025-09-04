import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

import {
	Text,
	SafeAreaView
} from 'react-native';

import { Provider } from '@ant-design/react-native';

const statusBarHeight = Constants.statusBarHeight;

const main = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				paddingTop: statusBarHeight,
				backgroundColor: 'white'
			}}
		>
			<StatusBar style='auto' />

			<Provider>
				<Text>iOSAS</Text>
			</Provider>
		</SafeAreaView>
	);
};

export default main;
