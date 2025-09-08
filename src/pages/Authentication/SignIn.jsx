import React from 'react';
import packageJson from '../../../package.json';
import { useForm, Controller } from 'react-hook-form';
import supabase from '../../utils/supabase';

import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Toast } from '@ant-design/react-native';

import Button from '../../components/Button';
import Anchor from '../../components/Anchor';
import Text from '../../components/Text';
import Input from '../../components/forms/Input';
import IconButton from '../../components/IconButton';

import LogoBanner from '../../../assets/public/Logo Banner.png';

import { KeyboardShownContext, navigationRef } from '../../main';

import theme from '../../styles/theme';
const SignIn = () => {
	const version = packageJson.version;

	const { keyboardShown } = React.useContext(KeyboardShownContext);

	const {
		control,
		handleSubmit,
		getValues,
		setValue,
		setError,
		resetField,
		clearErrors,
		formState: { errors }
	} = useForm();

	const [showPassword, setShowPassword] = React.useState(false);

	const onSubmit = async (data) => {
		const { email, password } = data;

		const { data: userData, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			Toast.fail(error.message, 0.5);
			return;
		};

		console.log(userData);
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

				{/***************************************** Form *****************************************/}
				<Flex
					direction='column'
					justify='center'
					align='stretch'
					gap={16}
					style={{ flex: 1, width: '100%' }}
				>
					<Controller
						control={control}
						name='email'
						rules={{
							required: 'Email Address is required'
						}}
						render={({
							field: { onChange, onBlur, value }
						}) => (
							<Input
								placeholder='Email Address'
								type='email-address'
								name='email'
								required
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
							required: 'Password is required'
						}}
						render={({
							field: { onChange, onBlur, value }
						}) => (
							<Input
								placeholder='Password'
								type={showPassword ? 'text' : 'password'}
								name='password'
								required
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								withError={!!errors?.password}
								errorComponent={
									<Text
										style={{ color: theme.brand_error }}
									>{`${errors?.password?.message}`}</Text>
								}

								suffix={
									<IconButton
										name={showPassword ? 'eye-invisible' : 'eye'}
										size='small'
										onPress={() => setShowPassword(!showPassword)}
									/>
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

					<Text style={{ textAlign: 'center' }}>
						<Anchor to='SignUp'>Sign Up</Anchor> or <Anchor to='Recovery'>Recover your Account</Anchor>
					</Text>
				</Flex>

				{/***************************************** Footer *****************************************/}
				{!keyboardShown && (
					<>
						<Button
							type='default'
							size='large'
							icon='google'
							style={{ width: '100%' }}
						>
							Sign In with Google
						</Button>

						<Text>Copyright © Colegio de Montalban 2025</Text>
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

export default SignIn;
