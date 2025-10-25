import React from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

import Text from './Text';
import { useCache } from '../contexts/CacheContext';
import { useRefresh } from '../contexts/useRefresh';
import authFetch from '../utils/authFetch';
import theme from '../styles/theme';

/**
 * A reusable component for displaying items in a list with infinite scrolling
 * @param {{
 *  fetchUrl: string;
 * 	header: React.ReactNode;
 * 	refreshControl: React.ReactNode;
 * 	limit?: number;
 * 	transformItem?: (item: any) => any;
 * 	cacheKey?: keyof import('../contexts/CacheContext').Cache;
 * 	renderItem?: (item: any) => JSX.Element;
 * }} props
 * @returns {JSX.Element}
 */
const ContentPage = ({
	fetchUrl,
	header,
	refreshControl,
	limit = 10,
	transformItem = (item) => item,
	cacheKey,
	renderItem = (item) => <Text key={item.id}>{JSON.stringify(item)}</Text>,
}) => {
	const [items, setItems] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const { updateCache } = useCache();
	const { refresh } = useRefresh();

	React.useEffect(() => {
		const controller = new AbortController();

		const fetchItems = async () => {
			setLoading(true);
			const request = await authFetch(`${fetchUrl}?limit=${limit}&offset=${page * limit}`, {
				signal: controller.signal
			}).catch((error) => {
				console.error('Error fetching items data:', error);
			});

			const data = await request.json();
			if (!data) {
				console.error('Invalid items data received');
				setLoading(false);
				return;
			};

			setItems(transformItem(data) || []);
			console.log({
				dataFetched: data.length,
				transformedData: transformItem(data).length
			});
			updateCache(cacheKey, transformItem(data) || []);
			setLoading(false);
		};

		fetchItems();
		return () => controller.abort();
	}, [fetchUrl, page, refresh]);

	return (
		<ScrollView
			refreshControl={refreshControl}
			style={{ flex: 1 }}
			contentContainerStyle={{ gap: theme.v_spacing_sm }}
		>
			{header}

			{loading ? (
				<ActivityIndicator size='large' color={theme.primary} style={{ marginTop: 20 }} />
			) : (
					items.map((item) => renderItem(item))
			)}
		</ScrollView>
	);
};

export default ContentPage;
