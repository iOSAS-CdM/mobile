import React from 'react';
import { StatusBar } from 'expo-status-bar';
import packageJson from '../../../package.json';

import { Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Text, Form, Input, Card } from '@ant-design/react-native';

import Button from '../../components/Button';
import Title from '../../components/Title';
import Anchor from '../../components/Anchor';

import LogoBanner from '../../../assets/public/Logo Banner.png';
import Logo from '../../../assets/public/Logo.png';

import theme from '../../styles/theme';
const SignUp = () => {
	const version = packageJson.version;

	const [keyboardShown, setKeyboardShown] = React.useState(false);

	React.useEffect(() => {
		const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardShown(true));
		const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardShown(false));

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, []);

	return (
		<>
			<StatusBar style='auto' translucent />

			<Flex
				direction='column'
				justify='space-between'
				gap={32}
				style={{
					position: 'relative',
					width: '100%',
					minHeight: '100%',
					padding: 32,
					backgroundColor: theme.fill_body
				}}
			>
				{/***************************************** Form *****************************************/}
				<Flex direction='column' justify='center' align='stretch' gap={16} style={{ flex: 1, width: '100%' }}>
					<Flex direction='row' justify='center' align='center' gap={4} >
						<Title level={4}>Welcome to</Title>
						<Image
							source={Logo}
							style={{ width: 64, height: 32 }}
							contentFit='contain'
						/>
					</Flex>

					<Form
						name='signUp'
						layout='vertical'
						style={{ width: '100%', maxWidth: 512 }}
						noStyle
					>
						<Flex direction='column' justify='center' align='stretch' gap={16} style={{ width: '100%' }}>
							<Card><Form.Item noStyle><Input placeholder='Student ID' /></Form.Item></Card>
							<Card><Form.Item noStyle><Input placeholder='Email Address' /></Form.Item></Card>
							<Card><Form.Item noStyle><Input placeholder='Password' secureTextEntry /></Form.Item></Card>
							<Card><Form.Item noStyle><Input placeholder='Confirm Password' secureTextEntry /></Form.Item></Card>
							<Form.Item noStyle>
								<Button type='primary' size='large'>
									Sign Up
								</Button>
							</Form.Item>
						</Flex>
					</Form>

					<Text style={{ textAlign: 'center' }}>
						<Anchor to='SignIn'>Sign In</Anchor> or <Anchor href='/'>Recover your Account</Anchor>
					</Text>
				</Flex>

				{/***************************************** Footer *****************************************/}
				{!keyboardShown && (
					<>
						<Button type='default' size='large' icon='google' style={{ width: '100%' }}>
							Sign In with Google
						</Button>

						<Text>Copyright © Colegio de Montalban 2025</Text>
						<Flex
							direction='column'
							justify='space-between'
							align='start'
							style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}
						>
							<Text style={{ fontSize: 8 }}>v{version}</Text>
							<Text style={{ fontSize: 8 }}>For issues, please contact us via <Anchor href='mailto:danieljohnbyns@gmail.com'>danieljohnbyns@gmail.com</Anchor></Text>
						</Flex>
					</>
				)}
			</Flex>
		</>
	);
};

export default SignUp;
