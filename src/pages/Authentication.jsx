import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import { Provider } from '@ant-design/react-native';
import {
	Text,
	SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';

import { Flex, Card } from '@ant-design/react-native';

import LogoBanser from '../../assets/public/Logo Banner.png';

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
				<Flex
					direction='column'
					justify='space-between'
					style={{
						position: 'relative',
						width: '100%',
						height: '100%',
						padding: 32
					}}
				>
					<Image
						source={LogoBanser}
						style={{
							width: '100%',
							maxWidth: 512,
							height: 128,
							objectFit: 'contain',
						}}
						contentFit='contain'
					/>
					<Text>Copyright © Colegio de Montalban 2025</Text>
				</Flex>
			</Provider>
		</SafeAreaView>
	);
};

export default Authentication;
