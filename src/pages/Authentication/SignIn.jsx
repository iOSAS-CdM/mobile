import { StatusBar } from 'expo-status-bar';
import packageJson from '../../../package.json';
import Constants from 'expo-constants';
const statusBarHeight = Constants.statusBarHeight;

import {
	SafeAreaView,
	ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { Flex, Text } from '@ant-design/react-native';

import Button from '../../components/Button';

import LogoBanner from '../../../assets/public/Logo Banner.png';

const SignIn = () => {
	const version = packageJson.version;

	return (
		<SafeAreaView style={{ flex: 1, paddingTop: statusBarHeight }}>
			<StatusBar style='auto' />

			<ScrollView>
				<Flex
					direction='column'
					justify='space-between'
					gap={32}
					style={{
						position: 'relative',
						width: '100%',
						minHeight: '100%',
						padding: 32
					}}
				>
					{/***************************************** Banner *****************************************/}
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

					{/***************************************** Forms *****************************************/}
					<Flex direction='column' justify='center' align='center' gap={16} style={{ flex: 1 }}>
					</Flex>

					<Button type='default' size='large' icon='google' style={{ width: '100%' }}>
						Sign In with Google
					</Button>

					{/***************************************** Footer *****************************************/}
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
			</ScrollView>
		</SafeAreaView>
	);
};

export default SignIn;
