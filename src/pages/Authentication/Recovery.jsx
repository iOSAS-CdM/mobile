import React from 'react';
import packageJson from '../../../package.json';
import { useForm, Controller } from 'react-hook-form';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Flex, Toast } from '@ant-design/react-native';

import Button from '../../components/Button';
import Anchor from '../../components/Anchor';
import Title from '../../components/Title';
import Text from '../../components/Text';
import Input from '../../components/forms/Input';

import { useKeyboard } from '../../contexts/useKeyboard';
import { navigationRef, API_Route } from '../../main';

import theme from '../../styles/theme';
const Recovery = () => {
	const version = packageJson.version;

	const keyboardShown = useKeyboard();

	const [step, setStep] = React.useState(1); // 1: Confirm ID and Email, 2: Verify OTP, 3: Reset Password
	const [user, setUser] = React.useState({});
	const [otp, setOtp] = React.useState(null);
	const [sending, setSending] = React.useState(false);
	const [verifying, setVerifying] = React.useState(false);
	const [resetting, setResetting] = React.useState(false);

	// Form 1: Student Info
	const {
		control: controlStep1,
		handleSubmit: handleSubmitStep1,
		formState: { errors: errorsStep1 },
		setError: setErrorStep1
	} = useForm();

	// Form 2: OTP
	const {
		control: controlStep2,
		handleSubmit: handleSubmitStep2,
		formState: { errors: errorsStep2 },
		setError: setErrorStep2
	} = useForm();

	// Form 3: Reset Password
	const {
		control: controlStep3,
		handleSubmit: handleSubmitStep3,
		formState: { errors: errorsStep3 },
		setError: setErrorStep3,
		watch: watchStep3,
		getValues: getValuesStep3
	} = useForm();

	const sendOTP = async (values) => {
		setSending(true);
		const { id, email } = values;

		try {
			const request = await fetch(`${API_Route}/auth/student/password-recovery`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, email })
			});

			if (!request?.ok) {
				const errorData = await request.json();
				setErrorStep1('email', { type: 'manual', message: errorData.message || 'Failed to send OTP' });
				setSending(false);
				return;
			}

			const data = await request.json();
			setUser(data);
			setStep(2);
			Toast.success('OTP sent to your email!', 1);
		} catch (error) {
			console.error('Error sending OTP:', error);
			setErrorStep1('email', { type: 'manual', message: 'Network error. Please try again.' });
		}
		setSending(false);
	};

	const verifyOTP = async (values) => {
		setVerifying(true);
		const { otp: otpValue } = values;

		try {
			const request = await fetch(`${API_Route}/auth/student/verify-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: user.id, email: user.email, otp: otpValue })
			});

			if (!request?.ok) {
				const errorData = await request.json();
				setErrorStep2('otp', { type: 'manual', message: errorData.message || 'Invalid OTP' });
				setVerifying(false);
				return;
			}

			setOtp(otpValue);
			setStep(3);
			Toast.success('OTP verified!', 1);
		} catch (error) {
			console.error('Error verifying OTP:', error);
			setErrorStep2('otp', { type: 'manual', message: 'Network error. Please try again.' });
		}
		setVerifying(false);
	};

	const resetPassword = async (values) => {
		setResetting(true);
		const { password } = values;

		try {
			const request = await fetch(`${API_Route}/auth/student/reset-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: user.id, email: user.email, otp, password })
			});

			if (!request?.ok) {
				const errorData = await request.json();
				setErrorStep3('password', { type: 'manual', message: errorData.message || 'Failed to reset password' });
				setResetting(false);
				return;
			}

			Toast.success('Password reset successfully!', 1);
			navigationRef.current?.navigate('SignIn');
		} catch (error) {
			console.error('Error resetting password:', error);
			setErrorStep3('password', { type: 'manual', message: 'Network error. Please try again.' });
		}
		setResetting(false);
	};

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
				{/***************************************** Form *****************************************/}
				<Flex
					direction='column'
					justify='center'
					align='stretch'
					gap={16}
					style={{ flex: 1, width: '100%' }}
				>
					<Flex
						direction='column'
						justify='center'
						align='center'
						gap={8}
					>
						<Title center level={1} style={{ color: theme.brand_primary, fontWeight: 'bold' }}>
							{step === 1 ? 'Reset Password' : user?.name?.first || 'Reset Password'}
						</Title>
					</Flex>

					{step === 1 && (
						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Controller
								control={controlStep1}
								name='id'
								rules={{ required: 'Please input your Student ID!' }}
								render={({ field: { onChange, onBlur, value } }) => (
									<Input
										placeholder='Student ID'
										name='id'
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errorsStep1?.id}
										errorComponent={
											<Text style={{ color: theme.brand_error }}>
												{errorsStep1?.id?.message}
											</Text>
										}
									/>
								)}
							/>
							<Controller
								control={controlStep1}
								name='email'
								rules={{
									required: 'Please input your email!',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Please enter a valid email address'
									}
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<Input
										placeholder='Email Address'
										name='email'
										keyboardType='email-address'
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errorsStep1?.email}
										errorComponent={
											<Text style={{ color: theme.brand_error }}>
												{errorsStep1?.email?.message}
											</Text>
										}
									/>
								)}
							/>
							<Button
								type='primary'
								size='large'
								loading={sending}
								onPress={handleSubmitStep1(sendOTP)}
							>
								Send OTP
							</Button>
						</Flex>
					)}

					{step === 2 && (
						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Text style={{ textAlign: 'center' }}>
								An OTP has been sent to your email.{'\n'}
								Please enter it below to verify your identity.
							</Text>

							<Controller
								control={controlStep2}
								name='otp'
								rules={{
									required: 'Please input the OTP sent to your email!',
									pattern: {
										value: /^\d{6}$/,
										message: 'OTP must be a 6-digit number!'
									},
									minLength: {
										value: 6,
										message: 'OTP must be exactly 6 digits long!'
									}
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<Input
										placeholder='OTP (e.g., 123456)'
										name='otp'
										keyboardType='number-pad'
										maxLength={6}
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errorsStep2?.otp}
										errorComponent={
											<Text style={{ color: theme.brand_error }}>
												{errorsStep2?.otp?.message}
											</Text>
										}
									/>
								)}
							/>

							<Text style={{ textAlign: 'center' }}>
								Did not receive the OTP?{' '}
								<Text
									style={{ color: theme.brand_primary, textDecorationLine: 'underline' }}
									onPress={() => {
										if (!sending) {
											sendOTP({ id: user.id, email: user.email });
										}
									}}
								>
									{sending ? 'Sending...' : 'Resend OTP'}
								</Text>
							</Text>

							<Button
								type='primary'
								size='large'
								loading={verifying}
								onPress={handleSubmitStep2(verifyOTP)}
							>
								Verify OTP
							</Button>
						</Flex>
					)}

					{step === 3 && (
						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Controller
								control={controlStep3}
								name='password'
								rules={{
									required: 'Please input your password!',
									validate: {
										minLength: (value) =>
											value.length >= 8 || 'Password must be at least 8 characters!',
										hasLetter: (value) =>
											/[a-z]/i.test(value) || 'Password must contain at least one letter!',
										hasNumber: (value) =>
											/[0-9]/.test(value) || 'Password must contain at least one number!'
									}
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<Input
										placeholder='New Password'
										name='password'
										secureTextEntry
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errorsStep3?.password}
										errorComponent={
											<Text style={{ color: theme.brand_error }}>
												{errorsStep3?.password?.message}
											</Text>
										}
									/>
								)}
							/>
							<Controller
								control={controlStep3}
								name='confirmPassword'
								rules={{
									required: 'Please confirm your password!',
									validate: (value) =>
										value === watchStep3('password') || 'Passwords do not match!'
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<Input
										placeholder='Confirm New Password'
										name='confirmPassword'
										secureTextEntry
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errorsStep3?.confirmPassword}
										errorComponent={
											<Text style={{ color: theme.brand_error }}>
												{errorsStep3?.confirmPassword?.message}
											</Text>
										}
									/>
								)}
							/>
							<Button
								type='primary'
								size='large'
								loading={resetting}
								onPress={handleSubmitStep3(resetPassword)}
							>
								Reset Password
							</Button>
						</Flex>
					)}

					<Text style={{ textAlign: 'center', fontSize: theme.font_size_base }}>
						Remembered your password?{' '}
						<Anchor to='SignIn' style={{ textDecorationLine: 'underline' }}>Sign In</Anchor>
					</Text>
				</Flex>

				{/***************************************** Footer *****************************************/}
				{!keyboardShown && (
					<Flex
						direction='column'
						justify='space-between'
						align='start'
						style={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							padding: 8
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_icontext * 0.75
							}}
						>
							v{version}
						</Text>
						<Text
							style={{
								fontSize: theme.font_size_icontext * 0.75
							}}
						>
							For issues, please contact us via{' '}
							<Anchor
								href='mailto:danieljohnbyns@gmail.com'
								style={{ fontSize: 8 }}
							>
								danieljohnbyns@gmail.com
							</Anchor>
						</Text>
					</Flex>
				)}
			</Flex>
		</TouchableWithoutFeedback>
	);
};

export default Recovery;
