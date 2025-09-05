import React from 'react';
import packageJson from '../../../package.json';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Form, Input, Card } from '@ant-design/react-native';

import Button from '../../components/Button';
import Title from '../../components/Title';
import Anchor from '../../components/Anchor';
import Text from '../../components/Text';

import LogoBanner from '../../../assets/public/Logo Banner.png';
import Logo from '../../../assets/public/Logo.png';

import { KeyboardShownContext, navigationRef } from '../../main';

import theme from '../../styles/theme';
const SignIn = () => {
	const version = packageJson.version;

	const { keyboardShown } = React.useContext(KeyboardShownContext);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<Flex
				direction='column'
				justify='space-between'
				gap={32}
				style={{
					position: 'relative',
					width: '100%',
					minHeight: '100%',
					padding: 32,
					backgroundColor: theme.fill_base
				}}
			>
				{/***************************************** Banner *****************************************/}
				<Image
					source={LogoBanner}
					style={{
						width: '100%',
						maxWidth: 512,
						height: 128
					}}
					contentFit='contain'
				/>

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
						name='signIn'
						layout='vertical'
						style={{ width: '100%', maxWidth: 512, backgroundColor: theme.fill_base }}
						noStyle
					>
						<Flex direction='column' justify='center' align='stretch' gap={16} style={{ width: '100%' }}>
							<Card><Form.Item noStyle><Input placeholder='Email Address' /></Form.Item></Card>
							<Card><Form.Item noStyle><Input placeholder='Password' secureTextEntry /></Form.Item></Card>
							<Form.Item noStyle>
								<Button type='primary' size='large' onPress={() => navigationRef.current?.navigate('Feed')}>
									Sign In
								</Button>
							</Form.Item>
						</Flex>
					</Form>

					<Text style={{ textAlign: 'center' }}>
						<Anchor to='SignUp'>Sign Up</Anchor> or <Anchor to='Recovery'>Recover your Account</Anchor>
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
							<Text style={{ fontSize: theme.font_size_icontext * 0.75 }}>v{version}</Text>
							<Text style={{ fontSize: theme.font_size_icontext * 0.75 }}>For issues, please contact us via <Anchor href='mailto:danieljohnbyns@gmail.com' style={{ fontSize: 8 }}>danieljohnbyns@gmail.com</Anchor></Text>
						</Flex>
					</>
				)}
			</Flex>
		</TouchableWithoutFeedback>
	);
};

export default SignIn;
