import React from 'react';
import { ScrollView, Dimensions, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { Flex, Icon, Tooltip } from '@ant-design/react-native';
import Image from 'react-native-scalable-image';

import Text from '../../../../components/Text';
import Avatar from '../../../../components/Avatar';
import Button from '../../../../components/Button';

import { API_Route, navigationRef } from '../../../../main';
import { useCache } from '../../../../contexts/CacheContext';
import authFetch from '../../../../utils/authFetch';

import theme from '../../../../styles/theme';

/**
 * Organization detail view used by navigation stack.
 * Expects `organization` and optional `setOrganization` in route.params
 */
const ViewOrganization = ({ route }) => {
	const org = route.params?.organization || null;
	const setOrganization = route.params?.setOrganization || (() => { });
	const { cache, updateCacheItem, pushToCache } = useCache();
	const [organization, setLocalOrganization] = React.useState(org);

	React.useEffect(() => {
		// If we were passed an ID only or want to refresh, fetch full org
		const fetchOrg = async () => {
			if (!organization || !organization.id) return;
			try {
				const res = await authFetch(`${API_Route}/organizations/${organization.id}`);
				if (res && res.ok) {
					const data = await res.json();
					setLocalOrganization(data);
					try { updateCacheItem && updateCacheItem('organizations', 'id', data.id, data); } catch (e) { try { pushToCache && pushToCache('organizations', data, true); } catch (e) { /* ignore */ } }
				}
			} catch (e) {
				// ignore - show existing passed data
			};
		};
		fetchOrg();
	}, []);

	if (!organization) return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				padding: 16,
				backgroundColor: theme.fill_base
			}}
		>
			<Text style={{ fontSize: theme.font_size_heading, fontWeight: '600', marginBottom: 8 }}>No Organization Data</Text>
			<Text style={{ fontSize: theme.font_size_subhead, textAlign: 'center' }}>Unable to display organization details. Please go back and select a valid organization.</Text>
		</View>
	);

	return (
		<>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Flex
					direction='row'
					justify='space-between'
					align='center'
					style={{
						width: '100%',
						padding: theme.v_spacing_md,
						borderBottomWidth: 0.25,
						borderBottomColor: theme.border_color_base,
						backgroundColor: theme.fill_base
					}}
				>
					<Button size='small' icon='left' onPress={() => { navigationRef.current?.goBack(); }} />
					<Text style={{ fontSize: theme.font_size_subhead, fontWeight: '600' }}>Organization</Text>
					{
						// show a publish button for organization publishers
						(() => {
							const userId = (cache && cache.user && cache.user.id) || null;
							const isPublisher = !!(organization && organization.members && organization.members.find(m => ((m.id === userId) || (m.student && m.student.id === userId)) && m.publisher));
							if (!isPublisher) return <Button size='small' icon='left' style={{ opacity: 0 }} />;
							return <Button size='small' onPress={() => navigationRef.current?.navigate('NewOrgAnnouncement', { organization })}>Publish</Button>;
						})()
					}
				</Flex>
			</TouchableWithoutFeedback>

			<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
				<Flex direction='column' align='stretch' style={{ gap: theme.v_spacing_md, backgroundColor: theme.fill_body }}>
					<Flex direction='column' align='stretch' style={{ gap: theme.v_spacing_md, backgroundColor: theme.fill_base }}>
						<View>
							{organization.cover && (
								<Image source={{ uri: organization.cover }} width={Dimensions.get('window').width} />
							)}
							<Avatar
								size={64}
								uri={organization.logo}
								style={{
									position: 'absolute',
									bottom: 8,
									left: 16,
									borderWidth: 1,
									borderColor: theme.border_color_base,
									backgroundColor: theme.fill_base
								}}
							/>
						</View>
						<Flex
							direction='column'
							justify='flex-start'
							align='stretch'
							style={{ padding: theme.v_spacing_md, backgroundColor: theme.fill_base }}
						>
							<Text style={{ fontSize: theme.font_size_heading, fontWeight: '600' }}>{organization.shortName}</Text>
							<Text style={{ color: theme.color_text_secondary }}>{organization.fullName}</Text>
						</Flex>
					</Flex>



					<Flex
						direction='column'
						justify='flex-start'
						align='stretch'
						style={{ padding: theme.v_spacing_md, gap: theme.v_spacing_sm, backgroundColor: theme.fill_base }}
					>
						<Text style={{ fontSize: theme.font_size_subhead, fontWeight: '600' }}>Members</Text>
						{organization.members && organization.members.length > 0 ? (
							organization.members.map((member) => (
								<Flex
									key={member.id}
									direction='row'
									justify='flex-start'
									align='center'
									style={{ gap: theme.h_spacing_sm }}
								>
									<Avatar size={32} uri={member.student.profilePicture} />
									<Flex direction='column' justify='flex-start' align='stretch'>
										<Text style={{ fontSize: theme.font_size_caption_sm, fontWeight: '600' }}>{`${member.student.name.first} ${member.student.name.last}`}</Text>
										<Text style={{ color: theme.color_text_secondary }}>{member.role}</Text>
									</Flex>

									{member.publisher && (
										<Tooltip
											placement='bottom'
											crossOffset={0}
											content='This member has publishing privileges.'
										>
											<Icon
												name='star'
												color={theme.brand_warning}
												style={{ position: 'absolute', right: 0, top: 0 }}
											/>
										</Tooltip>
									)}
								</Flex>
							))
						) : (
							<Text style={{ color: theme.color_text_secondary }}>No members found.</Text>
						)}
					</Flex>
				</Flex>
			</ScrollView>
		</>
	);
};

export default ViewOrganization;
