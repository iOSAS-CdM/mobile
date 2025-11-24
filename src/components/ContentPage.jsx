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
	const [hasMore, setHasMore] = React.useState(true);
	const { updateCache } = useCache();
	const { refresh, setRefresh } = useRefresh();
	const updateCacheRef = React.useRef(updateCache);
	const transformItemRef = React.useRef(transformItem);
	const loadingRef = React.useRef(false);
	const loadingMoreRef = React.useRef(false);
	const abortControllerRef = React.useRef(null);

	React.useEffect(() => {
		updateCacheRef.current = updateCache;
	}, [updateCache]);

	React.useEffect(() => {
		transformItemRef.current = transformItem;
	}, [transformItem]);

	React.useEffect(() => () => {
		if (abortControllerRef.current)
			abortControllerRef.current.abort();
	}, []);

	const fetchItems = React.useCallback(async (currentOffset, isLoadingMore = false) => {
		console.log(`Fetching items for ${cacheKey} at offset ${currentOffset}, isLoadingMore: ${isLoadingMore}`);
		const loadingFlag = isLoadingMore ? loadingMoreRef : loadingRef;
		if (loadingFlag.current) return;
		loadingFlag.current = true;

		if (abortControllerRef.current)
			abortControllerRef.current.abort();

		const controller = new AbortController();
		abortControllerRef.current = controller;

		if (isLoadingMore)
			setLoadingMore(true);
		else
			setLoading(true);

		try {
			const response = await authFetch(`${fetchUrl}?limit=${limit}&offset=${currentOffset}`, {
				signal: controller.signal
			});
			if (response?.status === 0) return;
			if (!response?.ok) {
				console.error('ContentPage: fetch failed', response?.status, response?.statusText);
				setHasMore(false);
				return;
			};

			const data = await response.json().catch(() => null);
			if (!data) {
				setHasMore(false);
				if (!isLoadingMore) {
					setItems([]);
					if (cacheKey && typeof updateCacheRef.current === 'function')
						updateCacheRef.current(cacheKey, []);
				};
				return;
			};

			const transformed = transformItemRef.current ? transformItemRef.current(data) : data;
			const normalized = Array.isArray(transformed)
				? transformed
				: Array.isArray(transformed?.records)
					? transformed.records
					: Array.isArray(data?.records)
						? data.records
						: Array.isArray(data?.items)
							? data.items
							: Array.isArray(data)
								? data
								: [];

			const reportedTotal = typeof data?.total === 'number'
				? data.total
				: typeof data?.count === 'number'
					? data.count
					: null;
			const nextTotal = reportedTotal != null
				? reportedTotal
				: isLoadingMore
					? currentOffset + normalized.length
					: normalized.length;
			setTotalLength(nextTotal);
			const nextHasMore = reportedTotal != null
				? currentOffset + normalized.length < reportedTotal
				: normalized.length === limit;
			setHasMore(nextHasMore);

			if (!normalized.length) {
				if (!isLoadingMore) {
					setItems([]);
					if (cacheKey && typeof updateCacheRef.current === 'function')
						updateCacheRef.current(cacheKey, []);
				};
				return;
			};

			const nextItems = normalized;

			if (isLoadingMore) {
				setItems((prevItems) => {
					if (!nextItems.length) return prevItems;
					const seen = new Set(prevItems.map((item) => item?.id ?? item?.key ?? JSON.stringify(item)));
					const merged = [...prevItems];
					for (const item of nextItems) {
						const key = item?.id ?? item?.key ?? JSON.stringify(item);
						if (!seen.has(key)) {
							seen.add(key);
							merged.push(item);
						};
					};
					return merged;
				});
			} else {
				setItems(nextItems);
			};

			if (cacheKey && typeof updateCacheRef.current === 'function')
				updateCacheRef.current(cacheKey, nextItems);

			console.log({
				totalLength: nextTotal,
				transformedData: nextItems.length,
				offset: currentOffset,
				isLoadingMore
			});
		} catch (error) {
			console.error('Error fetching items data:', error);
			setHasMore(false);
		} finally {
			if (isLoadingMore) {
				loadingMoreRef.current = false;
				setLoadingMore(false);
			} else {
				loadingRef.current = false;
				setLoading(false);
			}
			if (abortControllerRef.current === controller)
				abortControllerRef.current = null;
		};
	}, [fetchUrl, limit, cacheKey]);

	// Initial load and refresh
	React.useEffect(() => {
		if (refresh?.key === 'all' || refresh?.key === cacheKey || refresh == null) {
			setOffset(0);
			setHasMore(true);
			fetchItems(0, false);
		};
	}, [refresh, cacheKey, fetchItems]);

	// Handle infinite scroll
	const handleScroll = React.useCallback((event) => {
		const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
		const isNearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 1024;

		if (isNearEnd && hasMore && !loadingRef.current && !loadingMoreRef.current) {
			setOffset((prev) => {
				const nextOffset = prev + limit;
				fetchItems(nextOffset, true);
				return nextOffset;
			});
		};
	}, [limit, hasMore, fetchItems]);

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
