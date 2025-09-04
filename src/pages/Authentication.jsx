import { StatusBar } from 'expo-status-bar';
import packageJson from '../../package.json';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import {
	Text,
	SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';
import { Flex, Icon, Button } from '@ant-design/react-native';

import LogoBanner from '../../assets/public/Logo Banner.png';

const Authentication = () => {
	const version = packageJson.version;

	return (
		<SafeAreaView style={{ flex: 1, paddingTop: statusBarHeight }}>
			<StatusBar style='auto' />

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
					source={LogoBanner}
					style={{
						width: '100%',
						maxWidth: 512,
						height: 128,
						objectFit: 'contain'
					}}
					contentFit='contain'
				/>

				<Button size='small'>
					<Flex align='center' gap={8}>
						<Icon name='google' style={{ color: 'currentColor' }} />
						<Text>Sign In with Google</Text>
					</Flex>
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
