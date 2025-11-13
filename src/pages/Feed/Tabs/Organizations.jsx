import React from 'react';
import { RefreshControl, Dimensions } from 'react-native';
import Image from 'react-native-scalable-image';
import { Pressable } from 'react-native';

import { Flex } from '@ant-design/react-native';

import Text from './../../../components/Text';
import Avatar from './../../../components/Avatar';
import theme from '../../../styles/theme';

import ContentPage from '../../../components/ContentPage';
import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';
import { navigationRef, API_Route } from '../../../main';

const Organizations = () => {
	const { cache } = useCache();
	const { setRefresh } = useRefresh();

	const fetchUrl = `${API_Route}/users/student/${cache?.user?.id}/organizations`;


	return (
		<ContentPage
			fetchUrl={fetchUrl}
			cacheKey='organizations'
			transformItem={(data) => data.organizations || []}
			limit={10}
			contentGap={theme.v_spacing_sm}
			contentPadding={0}
			renderItem={(org) => (
				<Organization organization={org} onPress={(org) => navigationRef.current?.navigate('ViewOrganization', { organization: org })} />
			)}
			refreshControl={(
				<RefreshControl
					refreshing={false}
					onRefresh={() => setRefresh({ key: 'organizations', seeds: Date.now() })}
				/>
			)}
		/>
	);
};

/**
 * Organization list item used across the app.
 * Props: { organization, onPress }
 */
const Organization = ({ organization, onPress }) => {
	return (
		<Pressable
			android_ripple={{ color: theme.fill_mask }}
			onPress={() => onPress && onPress(organization)}
			style={{ backgroundColor: theme.fill_base, overflow: 'hidden' }}
		>
			{organization.cover ? (
				<Image source={{ uri: organization.cover }} width={Dimensions.get('window').width} />
			) : null}
			<Flex direction='row' align='center' gap={12} style={{ paddingHorizontal: theme.h_spacing_md, paddingVertical: theme.v_spacing_sm }}>
				<Avatar size='large' uri={organization.logo} />
				<Flex direction='column' align='start'>
					<Text style={{ fontWeight: 'bold' }}>{organization.fullName || organization.shortName}</Text>
					<Text style={{ color: theme.color_text_secondary }}>{organization.type}</Text>
				</Flex>
			</Flex>
		</Pressable>
	);
};

export default Organizations;
