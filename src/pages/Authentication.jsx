import { StatusBar } from 'expo-status-bar';
import packageJson from '../../package.json';
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
	const version = packageJson.version;
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

					<Flex
						direction='column'
						justify='space-between'
						align='start'
						style={{ position: 'absolute', bottom: 0, left: 0, padding: 8 }}
					>
						<Text style={{ fontSize: 8 }}>v{version}</Text>
						<Text style={{ fontSize: 8 }}>For issues, please contact us via danieljohnbyns@gmail.com</Text>
					</Flex>
				</Flex>
			</Provider>
		</SafeAreaView>
	);
};

export default Authentication;
