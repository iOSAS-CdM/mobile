import React from 'react';
import { ImageBackground, Image } from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import moment from 'moment';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import { Flex, Icon, View } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';

import supabase from '../../../utils/supabase';

import { navigationRef } from '../../../main';

import theme from '../../../styles/theme';

import Cover from '../../../../assets/public/cover.png';

const Profile = () => {
	const { cache } = useCache();
	const { setRefresh } = useRefresh();

	const [signingOut, setSigningOut] = React.useState(false);
	const handleSignOut = async () => {
		setSigningOut(true);
		await supabase.auth.signOut();
		setSigningOut(false);
		navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
	};

	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={false}
					onRefresh={async () => {
						setRefresh({
							key: 'user',
							callback: async () => {
								await supabase.auth.getUser();
							}
						});
					}}
				/>
			}
		>
			<Flex
				direction='column'
				align='start'
				justify='start'
				style={{ flex: 1, gap: theme.h_spacing_md }}
			>
				<Flex
					direction='column'
					align='start'
					justify='start'
					style={{ width: '100%' }}
				>
					<ImageBackground
						source={Cover}
						style={{
							position: 'relative',
							width: '100%',
							paddingHorizontal: theme.h_spacing_lg,
							paddingVertical: theme.v_spacing_lg,
							backgroundColor: theme.brand_primary,
							justifyContent: 'start',
							alignItems: 'start'
						}}
					>
						<View
							style={{ position: 'relative', width: 128, height: 128 }}
						>
							<Avatar
								size={128}
								source={{ uri: cache.user?.profilePicture }}
								alt='User Avatar'
								style={{
									borderWidth: 4,
									borderColor: theme.fill_base
								}}
							/>
							<Icon name='camera' size={32} style={{
								position: 'absolute',
								bottom: 0,
								right: 0,
								backgroundColor: theme.fill_base,
								borderRadius: 12,
								padding: theme.h_spacing_sm
							}} />
						</View>

						{cache.user?.role === 'unverified-student' && (
							<Text
								style={{
									position: 'absolute',
									bottom: 0,
									right: 0,
									paddingVertical: theme.v_spacing_sm,
									paddingHorizontal: theme.h_spacing_md,
									backgroundColor: theme.brand_warning,
									borderTopLeftRadius: theme.radius_lg,
									fontSize: theme.font_size_icontext,
									color: theme.fill_base
								}}
							>
								Unverified Student
							</Text>
						)}
					</ImageBackground>
					<Flex
						direction='column'
						align='start'
						justify='center'
						style={{
							width: '100%',
							paddingHorizontal: theme.h_spacing_lg,
							paddingVertical: theme.v_spacing_lg,
							backgroundColor: theme.fill_base
						}}
					>
						<Text
							style={{
								fontSize: theme.font_size_heading,
								fontWeight: 'bold',
								color: theme.brand_primary
							}}
						>
							{`${cache.user?.name?.first || ''} ${cache.user?.name?.last || ''
								}`}
						</Text>
						<Text style={{ fontSize: theme.font_size_caption }}>
							{cache.user?.id || ''}
						</Text>
						<Flex
							direction='row'
							align='center'
							justify='start'
							gap={8}
						>
							<Icon name='mail' size={theme.font_size_base} />
							<Text>{cache.user?.email}</Text>
						</Flex>
					</Flex>
				</Flex>

				{cache.user?.role === 'student' && (
					<Flex
						direction='column'
						align='stretch'
						justify='start'
						style={{
							width: '100%',
							padding: 16,
							gap: 16,
							backgroundColor: theme.fill_base
						}}
					>
						<Text style={{ fontWeight: 'bold', fontSize: theme.font_size_subhead, textAlign: 'center' }}>Verified Student</Text>
						<Image
							source={{ uri: `https://barcode.orcascan.com/?type=qrcode&data=${cache.user?.id}&fontsize=Fit&format=png&padding=0` }}
							style={{ width: 128, height: 128, alignSelf: 'center' }}
						/>
						<Text style={{ textAlign: 'center' }}>Since {moment(cache.user?.verifiedSince).format('MMMM DD YYYY')}</Text>
					</Flex>
				)}

				<Flex
					direction='column'
					align='stretch'
					justify='start'
					style={{
						width: '100%',
						padding: 16,
						gap: 16,
						backgroundColor: theme.fill_base
					}}
				>
					<Button type='primary' loading={signingOut} onPress={handleSignOut}>Sign Out</Button>
				</Flex>
			</Flex>
		</ScrollView>
	);
};

export default Profile;
