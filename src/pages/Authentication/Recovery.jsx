import React from 'react';
import packageJson from '../../../package.json';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Text, Form, Input, Card } from '@ant-design/react-native';

import Button from '../../components/Button';
import Anchor from '../../components/Anchor';
import Title from '../../components/Title';

import Logo from '../../../assets/public/Logo.png';

import { KeyboardShownContext } from '../../main';

import theme from '../../styles/theme';
const Recovery = () => {
	const version = packageJson.version;

	const { keyboardShown } = React.useContext(KeyboardShownContext);

	const [step, setStep] = React.useState(1); // 1: Confirm ID and Email, 2: Verify OTP, 3: Reset Password

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
					backgroundColor: theme.fill_body
				}}
			>
				{/***************************************** Form *****************************************/}
				<Flex direction='column' justify='center' align='stretch' gap={16} style={{ flex: 1, width: '100%' }}>
					<Flex direction='row' justify='center' align='center' gap={8}>
						<Title center level={2}>We're here to help you recover your account</Title>
					</Flex>

					{step === 1 && (
						<Form
							name='confirm'
							layout='vertical'
							style={{ width: '100%', maxWidth: 512 }}
							noStyle
						>
							<Flex direction='column' justify='center' align='stretch' gap={16} style={{ width: '100%' }}>
								<Card><Form.Item noStyle><Input placeholder='Student ID' /></Form.Item></Card>
								<Card><Form.Item noStyle><Input placeholder='Email Address' /></Form.Item></Card>
								<Form.Item noStyle>
									<Button type='primary' size='large' onPress={() => setStep(2)}>
										Confirm Account
									</Button>
								</Form.Item>
							</Flex>
						</Form>
					)}

					{step === 2 && (
						<Form
							name='verify'
							layout='vertical'
							style={{ width: '100%', maxWidth: 512 }}
							noStyle
						>
							<Flex direction='column' justify='center' align='stretch' gap={16} style={{ width: '100%' }}>
								<Card><Form.Item noStyle><Input placeholder='Verification Code' /></Form.Item></Card>
								<Form.Item noStyle>
									<Button type='primary' size='large' onPress={() => setStep(3)}>
										Verify Code
									</Button>
								</Form.Item>
							</Flex>
						</Form>
					)}

					{step === 3 && (
						<Form
							name='reset'
							layout='vertical'
							style={{ width: '100%', maxWidth: 512 }}
							noStyle
						>
							<Flex direction='column' justify='center' align='stretch' gap={16} style={{ width: '100%' }}>
								<Card><Form.Item noStyle><Input placeholder='New Password' secureTextEntry /></Form.Item></Card>
								<Card><Form.Item noStyle><Input placeholder='Confirm Password' secureTextEntry /></Form.Item></Card>
								<Form.Item noStyle>
									<Button type='primary' size='large'>
										Reset Password
									</Button>
								</Form.Item>
							</Flex>
						</Form>
					)}

					<Text style={{ textAlign: 'center' }}>
						<Anchor to='SignIn'>Sign In</Anchor> or <Anchor to='SignUp'>Create an Account</Anchor>
					</Text>
				</Flex>

				{/***************************************** Footer *****************************************/}
				{!keyboardShown && (
					<Flex
						direction='column'
						justify='space-between'
						align='start'
						style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}
					>
						<Text style={{ fontSize: 8 }}>v{version}</Text>
						<Text style={{ fontSize: 8 }}>For issues, please contact us via <Anchor href='mailto:danieljohnbyns@gmail.com'>danieljohnbyns@gmail.com</Anchor></Text>
					</Flex>
				)}
			</Flex>
		</TouchableWithoutFeedback>
	);
};

export default Recovery;
