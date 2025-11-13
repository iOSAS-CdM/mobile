import React from 'react';
import packageJson from '../../../package.json';
import { useForm, Controller } from 'react-hook-form';
import supabase from '../../utils/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import { Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Toast } from '@ant-design/react-native';

import Button from '../../components/Button';
import Anchor from '../../components/Anchor';
import Text from '../../components/Text';
import Input from '../../components/forms/Input';
import IconButton from '../../components/IconButton';

import LogoBanner from '../../../assets/public/banner.png';

import { navigationRef } from '../../main';
import { useKeyboard } from '../../contexts/useKeyboard';

// Generate appropriate redirect URI based on build type and platform
const getRedirectUri = () => {
	// For native builds (not Expo Go), use the custom scheme
	if (Platform.OS === 'ios' || Platform.OS === 'android') {
		return makeRedirectUri({
			scheme: 'com.danieljohnbyns.iosas',
			path: 'oauth'
		});
	};
	// For web and Expo Go
	return makeRedirectUri();
};

const redirectTo = getRedirectUri();
console.log('Redirect URI:', redirectTo);
/** @type {(url: string) => Promise<import('@supabase/supabase-js').Session | null>} */
const createSessionFromUrl = (url) =>
	new Promise(async (resolve, reject) => {
		try {
			const { params, errorCode } = QueryParams.getQueryParams(url);

			if (errorCode) throw new Error(errorCode);
			const { access_token, refresh_token } = params;

			if (!access_token) return resolve(null);

			const { data, error } = await supabase.auth.setSession({
				access_token,
				refresh_token
			});
			if (error) throw error;
			resolve(data.session);
		} catch (err) {
			reject(err);
		};
	});

/** @type {() => Promise<import('@supabase/supabase-js').Session | null>} */
const performOAuth = () =>
	new Promise(async (resolve, reject) => {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: redirectTo,
					skipBrowserRedirect: true
				}
			});
			if (error) throw error;

			const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo, {
				showTitle: false,
				enableBarCollapsing: true
			});

			if (res.type === 'success') {
				const session = await createSessionFromUrl(res.url);
				resolve(session);
			} else {
				reject(new Error('OAuth sign-in was not successful.'));
			};
		} catch (err) {
			reject(err);
		};
	});



import theme from '../../styles/theme';
import authFetch from '../../utils/authFetch';
const SignIn = () => {
	const version = packageJson.version;

	const keyboardShown = useKeyboard();

	const {
		control,
		handleSubmit,
		formState: { errors }
	} = useForm();

	const [showPassword, setShowPassword] = React.useState(false);

	const [signingIn, setSigningIn] = React.useState(false);
	const onSubmit = async (data) => {
		const { email, password } = data;
		setSigningIn(true);

		const { data: userData, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			Toast.fail(error.message, 0.5);
			setSigningIn(false);
			return;
		};

		if (userData?.user) {
			Toast.success('Successfully Signed In!', 0.5);
			navigationRef.current?.navigate('Feed');
		} else {
			Toast.fail('Failed to Sign In.', 0.5);
		};
		setSigningIn(false);
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
								secureTextEntry={!showPassword}
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
						loading={signingIn}
						onPress={handleSubmit(onSubmit)}
					>
						Sign In
					</Button>

					<Flex direction='column' justify='center' align='center' gap={theme.v_spacing_xs}>
						<Text style={{ textAlign: 'center', fontSize: theme.font_size_base }}>
							<Anchor to='Recovery'>Forgot your password?</Anchor>
					</Text>
						<Text style={{ textAlign: 'center', fontSize: theme.font_size_base }}>
							or
						</Text>
						<Text style={{ textAlign: 'center', fontSize: theme.font_size_base, textDecorationLine: 'underline' }}>
							<Anchor to='SignUp'>Create a new account.</Anchor>
						</Text>
					</Flex>
				</Flex>

				{/***************************************** Footer *****************************************/}
				{!keyboardShown && (
					<>
						<Button
							type='default'
							size='large'
							icon='google'
							style={{ width: '100%' }}
							onPress={async () => {
								try {
									const session = await performOAuth();
									if (session) {
										Toast.success('Successfully Signed In!', 0.5);
										navigationRef.current?.navigate('Feed');
									} else {
										Toast.fail('Failed to Sign In.', 0.5);
									};
								} catch (error) {
									Toast.fail(error.message, 0.5);
								};
							}}
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
