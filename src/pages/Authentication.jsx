import { StatusBar } from 'expo-status-bar';
import packageJson from '../../package.json';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import {
	Text,
	SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';
import { Flex, Button } from '@ant-design/react-native';

import LogoBanner from '../../assets/public/Logo Banner.png';

import SignIn from './Authentication/SignIn';

const Authentication = () => {
	const version = packageJson.version;

	return (
		<SafeAreaView style={{ flex: 1, paddingTop: statusBarHeight }}>
			<StatusBar style='auto' />

			<Flex
				direction='column'
				justify='space-between'
				gap={32}
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					padding: 32
				}}
			>
				<Image
					source={LogoBanner}
					style={{
						width: '100%',
						maxWidth: 512,
						height: 128,
						objectFit: 'contain'
					}}
					contentFit='contain'
				/>

				<Flex direction='column' align='center' gap={16} style={{ flex: 1 }}>
					<SignIn />
				</Flex>

				<Button size='large' style={{ width: '100%' }}>
					Create an Account
				</Button>

				<Text>Copyright © Colegio de Montalban 2025</Text>
				<Flex
					direction='column'
					justify='space-between'
					align='start'
					style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}
				>
					<Text style={{ fontSize: 8 }}>v{version}</Text>
					<Text style={{ fontSize: 8 }}>For issues, please contact us via danieljohnbyns@gmail.com</Text>
				</Flex>
			</Flex>
		</SafeAreaView>
	);
};

export default Authentication;
