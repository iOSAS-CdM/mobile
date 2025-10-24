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
 *  renderItem: (item: any, index: number) => JSX.Element;
 *  emptyText?: string;
 *  pageSize?: number;
 *  cacheKey?: string;
 *  onDataFetched?: (data: any) => void;
 *  transformData?: (data: any) => any[];
 *  numColumns?: number;
 *  refreshControl?: JSX.Element;
 *  ListHeaderComponent?: () => JSX.Element;
 * }} props
 * @returns {JSX.Element}
 */
const ContentPage = ({
	fetchUrl,
	renderItem,
	emptyText = 'No items found',
	pageSize = 20,
	cacheKey,
	onDataFetched,
	transformData = (data) => Array.isArray(data) ? data : [],
	numColumns = 1,
	refreshControl,
	ListHeaderComponent
}) => {
	const { updateCache, cache } = useCache();
	const { refresh } = useRefresh();
	const [loading, setLoading] = React.useState(true);
	const [loadingMore, setLoadingMore] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const [hasMore, setHasMore] = React.useState(true);

	// Initialize items from cache if available
	const [items, setItems] = React.useState(() => {
		if (cacheKey && cache && cache[cacheKey] && Array.isArray(cache[cacheKey]))
			return cache[cacheKey];
		return [];
	});

	// Track if we've completed an initial fetch
	const [hasFetched, setHasFetched] = React.useState(false);

	// Track the last fetched items to know when to update cache
	const lastFetchedItemsRef = React.useRef(null);

	// Keep items in sync with cache - use useEffect instead of during render
	React.useEffect(() => {
		if (!cacheKey || !hasFetched) return;
		const cachedCollection = cache && Array.isArray(cache[cacheKey]) ? cache[cacheKey] : null;
		if (cachedCollection) setItems(cachedCollection);
	}, [cacheKey, cache, hasFetched]);

	// Reset state when fetchUrl or refresh changes
	React.useEffect(() => {
		setPage(0);
		setItems([]);
		setHasMore(true);
		setHasFetched(false);
		lastFetchedItemsRef.current = null;
	}, [fetchUrl, refresh]);	// Fetch items function
	const fetchItems = React.useCallback(async (currentPage, isInitialLoad = false) => {
		if (isInitialLoad)
			setLoading(true);
		else
			setLoadingMore(true);

		// Add pagination parameters to the URL
		const paginatedUrl = fetchUrl + (fetchUrl.includes('?') ? '&' : '?') +
			`limit=${pageSize}&offset=${currentPage * pageSize}`;

		try {
			const request = await authFetch(paginatedUrl);
			if (!request?.ok) {
				if (isInitialLoad) setLoading(false);
				else setLoadingMore(false);
				return;
			};

			const data = await request.json();
			if (!data) {
				if (isInitialLoad) setLoading(false);
				else setLoadingMore(false);
				return;
			};

			const transformedItems = transformData(data);

			// Check if we've reached the end
			if (transformedItems.length < pageSize)
				setHasMore(false);

			// Append new items to existing items for infinite scroll
			setItems(prevItems => {
				const newItems = currentPage === 0 ? transformedItems : [...prevItems, ...transformedItems];

				// Update cache immediately after fetching (not in a separate effect)
				if (cacheKey) {
					lastFetchedItemsRef.current = newItems;
					// Use setTimeout to defer the cache update to avoid setState during render
					setTimeout(() => {
						updateCache(cacheKey, newItems);
					}, 0);
				};

				return newItems;
			});

			// Mark that we've completed at least one fetch
			setHasFetched(true);

			// Callback for parent component
			if (onDataFetched) onDataFetched(data);

		} catch (error) {
			console.error('Error fetching items:', error);
		} finally {
			if (isInitialLoad) setLoading(false);
			else setLoadingMore(false);
		};
	}, [fetchUrl, pageSize, transformData, onDataFetched, cacheKey, updateCache]);

	// Initial fetch
	React.useEffect(() => {
		fetchItems(0, true);
	}, [fetchUrl, refresh]);

	// Load more items when reaching end
	const handleLoadMore = () => {
		if (!loadingMore && hasMore && !loading) {
			setPage(prevPage => {
				const nextPage = prevPage + 1;
				fetchItems(nextPage, false);
				return nextPage;
			});
		};
	};

	// Render footer with loading indicator
	const renderFooter = () => {
		if (loadingMore) {
			return (
				<View style={styles.footer}>
					<ActivityIndicator size="small" color={theme.brand_primary} />
				</View>
			);
		};

		if (!hasMore && items.length > 0) {
			return (
				<View style={styles.footer}>
					<Text style={styles.endText}>No more items to load</Text>
				</View>
			);
		};

		return null;
	};

	// Render empty component
	const renderEmpty = () => {
		if (loading) {
			return (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={theme.brand_primary} />
				</View>
			);
		};

		return (
			<View style={styles.centerContainer}>
				<Text style={styles.emptyText}>{emptyText}</Text>
			</View>
		);
	};

	// Handle scroll event for infinite loading
	const handleScroll = (event) => {
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const paddingToBottom = 20;
		const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

		if (isCloseToBottom && !loadingMore && hasMore && !loading) {
			handleLoadMore();
		}
	};

	return (
		<ScrollView
			onScroll={handleScroll}
			scrollEventThrottle={400}
			contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.contentContainer}
			refreshControl={refreshControl}
		>
			{ListHeaderComponent && <ListHeaderComponent />}

			{items.length === 0 ? (
				renderEmpty()
			) : (
				<>
					{items.map((item, index) => (
						<View key={item.id?.toString() || index.toString()}>
							{renderItem(item, index)}
						</View>
					))}
					{renderFooter()}
				</>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	contentContainer: {
		gap: theme.v_spacing_sm
	},
	emptyContainer: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 256
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	footer: {
		paddingVertical: 20,
		alignItems: 'center'
	},
	endText: {
		fontSize: theme.font_size_caption_sm,
		color: theme.color_text_secondary,
		opacity: 0.5
	},
	emptyText: {
		fontSize: theme.font_size_base,
		color: theme.color_text_secondary
	}
});

export default ContentPage;
