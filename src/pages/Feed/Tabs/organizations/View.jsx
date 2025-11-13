import React from 'react';
import { ScrollView, Image, Pressable, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { Flex } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';

import Text from '../../../../components/Text';
import Title from '../../../../components/Title';
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
			}
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
					<Button size='small' icon='left' style={{ opacity: 0 }} />
				</Flex>
			</TouchableWithoutFeedback>

			<ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
				<Image source={{ uri: organization.cover }} style={{ width: '100%', height: 180, marginTop: theme.v_spacing_md }} resizeMode='cover' />
				<Flex direction='column' justify='center' align='stretch' style={{ width: '100%', backgroundColor: theme.fill_base, gap: theme.v_spacing_md }}>
					<Title level={3} style={{ paddingHorizontal: theme.h_spacing_md }}>{organization.fullName || organization.shortName}</Title>

					<View style={{ paddingHorizontal: theme.h_spacing_md }}>
						<Flex direction='row' align='center' gap={12} style={{ marginBottom: theme.v_spacing_sm }}>
							<Avatar size='large' uri={organization.logo} />
							<Flex direction='column'>
								<Text style={{ color: theme.color_text_secondary }}>{organization.type}</Text>
							</Flex>
						</Flex>

						{organization.description && (
							<Markdown>{organization.description}</Markdown>
						)}

						<Flex direction='column' align='stretch' gap={theme.v_spacing_md} style={{ width: '100%', marginTop: theme.v_spacing_md, marginBottom: theme.v_spacing_md }}>
							<Title level={4}>Members</Title>
							{organization.members && organization.members.length > 0 ? (
								organization.members.map((m) => (
									<Flex key={m.id} direction='row' align='center' gap={8} style={{ paddingVertical: 6 }}>
										<Avatar size='small' uri={m.student?.profilePicture} />
										<Text>{m.student?.name?.first} {m.student?.name?.last} — {m.role}</Text>
									</Flex>
								))
							) : (
								<Text>No members listed</Text>
							)}
						</Flex>
					</View>
				</Flex>
			</ScrollView>
		</>
	);
};

export default ViewOrganization;
