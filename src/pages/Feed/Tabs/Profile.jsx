import React from 'react';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import { Flex, Icon } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';

import supabase from '../../../utils/supabase';

import theme from '../../../styles/theme';

const Profile = () => {
	const { cache } = useCache();
	const { setRefresh } = useRefresh();

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
			<Flex direction='column' align='center' justify='start' style={{ flex: 1, gap: 16 }}>
				<Flex direction='column' align='center' justify='center' style={{ width: '100%', paddingTop: 64, paddingBottom: 32, gap: 16, backgroundColor: theme.fill_base }}>
					<Avatar
						size={128}
						source={{ uri: cache.user?.profilePicture }}
						alt='User Avatar'
					/>
					<Flex direction='column' align='center' justify='center'>
						<Text style={{ fontSize: theme.font_size_heading, fontWeight: 'bold', color: theme.brand_primary }}>
							{`${cache.user?.name?.first || ''} ${cache.user?.name?.last || ''}`}
						</Text>
						<Text style={{ fontSize: theme.font_size_caption }}>
							{cache.user?.id || ''}
						</Text>
						<Flex direction='row' align='center' justify='start' gap={8}>
							<Icon name='mail' size={theme.font_size_base} />
							<Text>{cache.user?.email}</Text>
						</Flex>
						{/* <Text style={{ fontSize: theme.font_size_base, color: theme.color_text_secondary }}>
							{{
								'ics': 'Institute of Computing Studies',
								'ite': 'Institute of Teacher Education',
								'ibe': 'Institute of Business Entrepreneurship'
							}[cache.user?.institute]}
						</Text> */}
					</Flex>
				</Flex>
				<Flex direction='column' align='stretch' justify='start' style={{ width: '100%', padding: 16, gap: 16, backgroundColor: theme.fill_base }}>
					<Button
						type='primary'
						onPress={async () => {
							await supabase.auth.signOut();
						}}
					>
						Sign Out
					</Button>
				</Flex>
			</Flex>
		</ScrollView>
	);
};

export default Profile;
