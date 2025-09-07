import React from 'react';
import packageJson from '../../../package.json';
import { useForm, Controller } from 'react-hook-form';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Checkbox } from '@ant-design/react-native';

import Button from '../../components/Button';
import Anchor from '../../components/Anchor';
import Title from '../../components/Title';
import Text from '../../components/Text';

import Input from '../../components/forms/Input';

import Logo from '../../../assets/public/Logo.png';

import { KeyboardShownContext } from '../../main';

import { API_Route } from '../../main';

import theme from '../../styles/theme';
const SignUp = () => {
	const version = packageJson.version;

	const { keyboardShown } = React.useContext(KeyboardShownContext);

	const [showPassword, setShowPassword] = React.useState(false);

	const {
		control,
		handleSubmit,
		getValues,
		setError,
		clearErrors,
		formState: { errors }
	} = useForm();

	/**
	 * @type {({
	 * 	id: String;
	 * 	email: String;
	 * 	password: String;
	 * }) => Promise<Void>}
	 */
	const onSubmit = async (data) => {
		console.log(data);
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
						direction='row'
						justify='center'
						align='center'
						gap={8}
					>
						<Title level={2}>Join us at</Title>
						<Image
							source={Logo}
							style={{
								width: 64,
								height: 32,
								objectFit: 'contain'
							}}
							contentFit='contain'
						/>
					</Flex>

					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={16}
						style={{ width: '100%' }}
					>
						<Controller
							control={control}
							name='id'
							rules={{
								required: 'Student ID is required',
								pattern: {
									value: /\d{2}-\d{5}/,
									message: 'Invalid Student ID'
								}
							}}
							render={({
								field: { onChange, onBlur, value }
							}) => (
								<Input
									placeholder='Student ID'
									type='text'
									name='id'
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									withError={!!errors?.id}
									errorComponent={
										<Text
											style={{ color: theme.brand_error }}
										>{`${errors?.id?.message}`}</Text>
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name='email'
							rules={{
								required: 'Email Address is required',
								pattern: {
									value: /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|.('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
									message: 'Invalid email address'
								}
							}}
							render={({
								field: { onChange, onBlur, value }
							}) => (
								<Input
									placeholder='Email Address'
									type='email-address'
									name='email'
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									withError={!!errors?.email}
									errorComponent={
										<Text
											style={{ color: theme.brand_error }}
										>{`${errors?.email?.message}`}</Text>
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name='password'
							rules={{
								required: 'Password is required',
								minLength: { value: 8, message: 'Password must be at least 8 characters long' },
								pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: 'Password must contain at least one letter and one number' },
								onChange: () => {
									if (getValues('password') !== getValues('confirmPassword'))
										setError('confirmPassword', { type: 'value', message: 'Passwords do not match' })
									else
										clearErrors('confirmPassword');
								}
							}}
							render={({
								field: { onChange, onBlur, value }
							}) => (
								<Input
									placeholder='Password'
									type={showPassword ? 'text' : 'password'}
									name='password'
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									withError={!!errors?.password}
									errorComponent={
										<Text
											style={{ color: theme.brand_error }}
										>{`${errors?.password?.message}`}</Text>
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name='confirmPassword'
							rules={{
								required: 'Please confirm your password',
								onChange: () => {
									if (getValues('password') !== getValues('confirmPassword'))
										setError('confirmPassword', { type: 'value', message: 'Passwords do not match' })
									else
										clearErrors('confirmPassword');
								}
							}}
							render={({
								field: { onChange, onBlur, value }
							}) => (
								<Input
									placeholder='Confirm Password'
									type={showPassword ? 'text' : 'password'}
									name='confirmPassword'
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									withError={!!errors?.confirmPassword}
									errorComponent={
										<Text
											style={{ color: theme.brand_error }}
										>{`${errors?.confirmPassword?.message}`}</Text>
									}
								/>
							)}
						/>
						<Button
							type='primary'
							size='large'
							onPress={handleSubmit(onSubmit)}
						>
							Sign Up
						</Button>
					</Flex>

					<Checkbox
						checked={showPassword}
						onChange={(e) => setShowPassword(e.target.checked)}
					>
						Show Passwords
					</Checkbox>
				</Flex>

				{/***************************************** Footer *****************************************/}
				{!keyboardShown && (
					<>
						<Text style={{ textAlign: 'center' }}>
							<Anchor to='SignIn'>Sign In</Anchor> or{' '}
							<Anchor to='Recovery'>Recover your Account</Anchor>
						</Text>
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
					</>
				)}
			</Flex>
		</TouchableWithoutFeedback>
	);
};

export default SignUp;
