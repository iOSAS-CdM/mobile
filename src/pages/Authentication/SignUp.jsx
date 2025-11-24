import React from 'react';
import packageJson from '../../../package.json';
import { useForm, Controller } from 'react-hook-form';
import * as WebBrowser from 'expo-web-browser';

import { ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Flex, Checkbox, Toast } from '@ant-design/react-native';

import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Anchor from '../../components/Anchor';
import Title from '../../components/Title';
import Text from '../../components/Text';

import Input from '../../components/forms/Input';
import Picker from '../../components/forms/Picker';

import Logo from '../../../assets/public/logo.png';

import { useKeyboard } from '../../contexts/useKeyboard';

import { API_Route, navigationRef } from '../../main';

import theme from '../../styles/theme';
const SignUp = () => {
	const version = packageJson.version;

	const keyboardShown = useKeyboard();

	const [showPassword, setShowPassword] = React.useState(false);

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

	const [signingUp, setSigningUp] = React.useState(false);
	/**
	 * @type {({
	 * 	id: string;
	 * 	email: string;
	 * 	firstName: string;
	 * 	middleName?: string;
	 * 	lastName: string;
	 * 	email: string;
	 * 	profilePicture: string;
	 * 	institute: 'ics' | 'ite' | 'ibe';
	 * 	program: string;
	 * 	year: number;
	 * 	password: string;
	 * }) => Promise<void>}
	 */
	const onSubmit = async (data) => {
		setSigningUp(true);
		const response = await fetch(`${API_Route}/auth/student/sign-up`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		}).catch((error) => {
			Toast.fail('Network error. Please try again.', 2);
		});
		if (!response) return setSigningUp(false);

		if (!response.ok) {
			const response = await response.json();
			if (response?.key && response?.message)
				setError(response.key, { type: 'server', message: response.message });
			Toast.fail(response?.message ?? 'An error occurred. Please try again.', 2);
			setSigningUp(false);
			return;
		};

		Toast.success('Account created successfully!', 2);
		navigationRef.current?.navigate('SignIn');
		setSigningUp(false);
	};

	const [institute, setInstitute] = React.useState();
	const programsPerInstitute = {
		'ics': ['BSCpE', 'BSIT'],
		'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
		'ibe': ['BSBA-HRM', 'BSE']
	};
	const programs = {
		'BSCpE': 'Bachelor of Science in Computer Engineering',
		'BSIT': 'Bachelor of Science in Information Technology',
		'BSEd-SCI': 'Bachelor of Secondary Education major in Science',
		'BEEd-GEN': 'Bachelor of Elementary Education - Generalist',
		'BEEd-ECED': 'Bachelor of Early Childhood Education',
		'BTLEd-ICT': 'Bachelor of Technology and Livelihood Education major in Information and Communication Technology',
		'TCP': 'Teacher Certificate Program',
		'BSBA-HRM': 'Bachelor of Science in Business Administration Major in Human Resource Management',
		'BSE': 'Bachelor of Science in Entrepreneurship'
	};

	const checkPasswordMatch = () => {
		if (`${getValues('password')}` !== `${getValues('confirmPassword')}`)
			setError('confirmPassword', { type: 'value', message: 'Passwords do not match' });
		else
			clearErrors('confirmPassword');
	};

	return (
		<ScrollView contentOffset={{ x: 0, y: 0 }} keyboardShouldPersistTaps='handled'>
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
				{/***************************************** Page *****************************************/}
				<Flex
					direction='column'
					justify='flex-start'
					align='stretch'
					gap={16}
					style={{ flex: 1, width: '100%' }}
				>
					{/***************************************** Header *****************************************/}
					<Flex
						direction='row'
						justify='space-between'
						align='center'
					>
						<IconButton
							iconType='outline'
							name='left'
							size='small'
							onPress={() => navigationRef.current?.goBack()}
						/>
						<Flex
							direction='row'
							justify='center'
							align='center'
							gap={8}
							style={{ flex: 1, width: '100%' }}
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
						<IconButton
							iconType='outline'
							name=''
							size='small'
						/>
					</Flex>
					{/***************************************** Form *****************************************/}
					<Flex
						direction='column'
						justify='center'
						align='stretch'
						gap={32}
						style={{ width: '100%' }}
					>
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
										required
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
						</Flex>

						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Title level={4}>Enter your name</Title>
							<Controller
								control={control}
								name='firstName'
								rules={{
									required: 'First Name is required',
									pattern: {
										value: /^[a-zA-Z ,.'-]+$/,
										message: 'Invalid First Name'
									}
								}}
								render={({
									field: { onChange, onBlur, value }
								}) => (
									<Input
										placeholder='First Name'
										type='text'
										name='firstName'
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errors?.firstName}
										errorComponent={
											<Text
												style={{ color: theme.brand_error }}
											>{`${errors?.firstName?.message}`}</Text>
										}
									/>
								)}
							/>
							<Controller
								control={control}
								name='middleName'
								rules={{
									pattern: {
										value: /^[a-zA-Z ,.'-]+$/,
										message: 'Invalid Middle Name'
									}
								}}
								render={({
									field: { onChange, onBlur, value }
								}) => (
									<Input
										placeholder='Middle Name (Optional)'
										type='text'
										name='middleName'
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errors?.middleName}
										errorComponent={
											<Text
												style={{ color: theme.brand_error }}
											>{`${errors?.middleName?.message}`}</Text>
										}
									/>
								)}
							/>
							<Controller
								control={control}
								name='lastName'
								rules={{
									required: 'Last Name is required',
									pattern: {
										value: /^[a-zA-Z ,.'-]+$/,
										message: 'Invalid Last Name'
									}
								}}
								render={({
									field: { onChange, onBlur, value }
								}) => (
									<Input
										placeholder='Last Name'
										type='text'
										name='lastName'
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errors?.lastName}
										errorComponent={
											<Text
												style={{ color: theme.brand_error }}
											>{`${errors?.lastName?.message}`}</Text>
										}
									/>
								)}
							/>
						</Flex>

						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Title level={4}>Enter your contact</Title>
							<Controller
								control={control}
								name='email'
								rules={{
									required: 'Email Address is required',
									pattern: {
										value: /^(([^<>()[\]\.,;:\s@']+(\.[^<>()[\]\.,;:\s@']+)*)|.('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
						</Flex>

						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Title level={4}>Enter your academic details</Title>
							<Controller
								control={control}
								name='institute'
								rules={{
									required: 'Institute is required'
								}}
								render={({
									field: { onChange, value }
								}) => (
									<Picker
										data={[
											{ label: 'Institute of Computing Studies', value: 'ics' },
											{ label: 'Institute of Teacher Education', value: 'ite' },
											{ label: 'Institute of Business Education', value: 'ibe' }
										]}
										labelField='label'
										valueField='value'
										placeholder='Select your Institute'
										value={value}
										onChange={(item) => {
											console.log('item', item)
											onChange(item.value);
											setInstitute(item.value);
											setValue('program', null);
											resetField('program');
											clearErrors('program');
										}}
										withError={!!errors?.institute}
										errorComponent={
											<Text
												style={{ color: theme.brand_error }}
											>{`${errors?.institute?.message}`}</Text>
										}
										required
									/>
								)}
							/>
							{institute && (
								<Controller
									control={control}
									name='program'
									rules={{
										required: 'Program is required'
									}}
									render={({
										field: { onChange, value }
									}) => (
										<Picker
											data={(programsPerInstitute?.[institute] ?? []).map((program) => ({
												label: programs[program],
												value: program
											}))}
											labelField='label'
											valueField='value'
											placeholder='Select your Program'
											disabled={!institute}
											value={value}
											onChange={(item) => {
												onChange(item.value);
											}}
											withError={!!errors?.program}
											errorComponent={
												<Text
													style={{ color: theme.brand_error }}
												>{`${errors?.program?.message}`}</Text>
											}
											required
										/>
									)}
								/>
							)}
							<Controller
								control={control}
								name='year'
								rules={{
									required: 'Year is required',
									pattern: {
										value: /^[1-5]$/,
										message: 'Invalid Year'
									}
								}}
								render={({
									field: { onChange, onBlur, value }
								}) => (
									<Input
										placeholder='Year (e.g., 1, 2, 3, 4)'
										type='number-pad'
										name='year'
										required
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										withError={!!errors?.year}
										errorComponent={
											<Text
												style={{ color: theme.brand_error }}
											>{`${errors?.year?.message}`}</Text>
										}
									/>
								)}
							/>
						</Flex>

						<Flex
							direction='column'
							justify='center'
							align='stretch'
							gap={16}
							style={{ width: '100%' }}
						>
							<Title level={4}>Enter your password</Title>
							<Controller
								control={control}
								name='password'
								rules={{
									required: 'Password is required',
									minLength: { value: 8, message: 'Password must be at least 8 characters long' },
									pattern: { value: /^(?=.*[a-zA-Z])(?=.*[0-9]).*$/, message: 'Password must contain at least one letter and one number' },
									onChange: () => {
										if (getValues('confirmPassword'))
											checkPasswordMatch();
									}
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
									/>
								)}
							/>
							<Controller
								control={control}
								name='confirmPassword'
								rules={{
									required: 'Please confirm your password',
									pattern: { value: new RegExp(getValues('password')), message: 'Passwords do not match' },
									onChange: () => {
										setTimeout(() => {
											if (getValues('confirmPassword'))
												checkPasswordMatch();
										}, 0);
									}
								}}
								render={({
									field: { onChange, onBlur, value }
								}) => (
									<Input
										placeholder='Confirm Password'
										secureTextEntry={!showPassword}
										name='confirmPassword'
										required
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
							<Checkbox
								checked={showPassword}
								onChange={(e) => setShowPassword(e.target.checked)}
							>
								Show Passwords
							</Checkbox>
							<Controller
								control={control}
								name='terms'
								rules={{
									required: 'You must agree to the Terms of Service and Privacy Policy'
								}}
								render={({
									field: { onChange, value }
								}) => (
									<Flex direction='column' align='start'>
										<Checkbox
											checked={value}
											onChange={(e) => onChange(e.target.checked)}
										>
											<Text>
												I agree to the <Text style={{ color: theme.brand_primary }} onPress={() => WebBrowser.openBrowserAsync('https://iosas.online/terms-of-service')}>Terms of Service</Text> and <Text style={{ color: theme.brand_primary }} onPress={() => WebBrowser.openBrowserAsync('https://iosas.online/privacy-policy')}>Privacy Policy</Text>
											</Text>
										</Checkbox>
										{errors?.terms && (
											<Text style={{ color: theme.brand_error, marginLeft: 24 }}>
												{errors.terms.message}
											</Text>
										)}
									</Flex>
								)}
							/>
						</Flex>

						<Button
							type='primary'
							size='large'
							loading={signingUp}
							onPress={handleSubmit(onSubmit)}
						>
							Sign Up
						</Button>
					</Flex>
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
		</ScrollView>
	);
};

export default SignUp;
