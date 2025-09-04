import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import { Provider } from '@ant-design/react-native';
import {
	Text,
	SafeAreaView
} from 'react-native';

const Authentication = () => {
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
				<Text>Authentication Page</Text>
			</Provider>
		</SafeAreaView>
	);
};

export default Authentication;
