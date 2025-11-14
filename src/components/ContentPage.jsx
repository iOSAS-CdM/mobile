import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import Text from './Text';
import Skeleton from './Skeleton';
import { useCache } from '../contexts/CacheContext';
import { useRefresh } from '../contexts/useRefresh';
import authFetch from '../utils/authFetch';
import theme from '../styles/theme';

/**
 * A reusable component for displaying items in a list with infinite scrolling
 * @param {{
 *  fetchUrl: string;
 * 	header: React.ReactNode;
 * 	limit?: number;
 * 	transformItem?: (item: any) => any;
 * 	cacheKey?: keyof import('../contexts/CacheContext').Cache;
 * 	renderItem?: (item: any) => JSX.Element;
 * 	columns?: number;
 *  headerGap?: number;
 *  contentGap?: number;
 *  contentPadding?: number;
 * }} props
 * @returns {JSX.Element}
 */
const ContentPage = ({
	fetchUrl,
	header,
	limit = 10,
	transformItem = (item) => item,
	cacheKey,
	headerGap = theme.v_spacing_sm,
	contentGap = theme.h_spacing_sm,
	contentPadding = theme.h_spacing_sm,
	renderItem = (item) => <Text key={item.id}>{JSON.stringify(item)}</Text>,
	columns = 1
}) => {
	const [items, setItems] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const [loadingMore, setLoadingMore] = React.useState(false);
	const [offset, setOffset] = React.useState(0);
	const [totalLength, setTotalLength] = React.useState(0);
	const { updateCache } = useCache();
	const { refresh, setRefresh } = useRefresh();

	const fetchItems = React.useCallback(async (currentOffset, isLoadingMore = false) => {
		if (isLoadingMore)
			setLoadingMore(true);
		else
			setLoading(true);

		try {
			const response = await authFetch(`${fetchUrl}?limit=${limit}&offset=${currentOffset}`, {
				signal: new AbortController().signal
			});
			if (response?.status === 0) return;

			const data = await response.json();
			if (!data || !data.length) {
				if (isLoadingMore) setLoadingMore(false);
				else setLoading(false);
				return;
			};

			const transformedData = transformItem(data) || [];

			if (isLoadingMore) {
				// Append new items to existing items
				setItems((prevItems) => [...prevItems, ...transformedData]);
			} else {
				// Reset items for initial load or refresh
				setItems(transformedData);
			};

			setTotalLength(data.length);
			updateCache(cacheKey, transformedData);

			console.log({
				totalLength: data.length,
				transformedData: transformedData.length,
				offset: currentOffset,
				isLoadingMore
			});

			if (isLoadingMore) setLoadingMore(false);
			else setLoading(false);
		} catch (error) {
			console.error('Error fetching items data:', error);
			if (isLoadingMore) setLoadingMore(false);
			else setLoading(false);
		};
	}, [fetchUrl, limit, transformItem, cacheKey, updateCache]);

	// Initial load and refresh
	React.useEffect(() => {
		if (refresh?.key === 'all' || refresh?.key === cacheKey || refresh == null) {
			setOffset(0);
			fetchItems(0, false);
		};
	}, [refresh]);

	// Handle infinite scroll
	const handleScroll = React.useCallback((event) => {
		const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
		const isNearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 1024;

		if (isNearEnd && !loading && !loadingMore && items.length < totalLength) {
			const nextOffset = offset + limit;
			setOffset(nextOffset);
			fetchItems(nextOffset, true);
		};
	}, [offset, limit, items.length, totalLength, loading, loadingMore, fetchItems]);

	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={loading}
					onRefresh={() => {
						setRefresh({
							key: cacheKey,
							seeds: Date.now()
						});
					}}
				/>
			}
			style={{ flex: 1 }}
			contentContainerStyle={{ gap: headerGap }}
			onScroll={handleScroll}
			scrollEventThrottle={16}
		>
			{header}

			<View style={styles.gridContainer(columns, contentGap, contentPadding)}>
				{loading ? (
					Array.from({ length: limit }).map((_, index) => (
						<View key={index} style={{ width: `${100 / columns - 2}%` }}>
							<Skeleton height={120} />
						</View>
					))
				) : (
					items.map(withGridItem(renderItem, columns, contentGap))
				)}
				{loadingMore && (
					Array.from({ length: columns }).map((_, index) => (
						<View key={`more-${index}`} style={{ width: `${100 / columns - 2}%` }}>
							<Skeleton height={120} />
						</View>
					))
				)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	gridContainer: (columns, contentGap, contentPadding) => ({
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: contentGap,
		paddingHorizontal: contentPadding
	})
});

// Wrap the renderItem with grid item styling
const withGridItem = (renderItem, columns, contentGap) => (item) => {
	const itemWidth = `${100 / columns - 2}%`;
	return (
		<View key={item.id} style={{ width: itemWidth, gap: contentGap }}>
			{renderItem(item)}
		</View>
	);
};

export default ContentPage;
