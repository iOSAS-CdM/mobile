// src/contexts/CacheContext.js
import React from 'react';

// Create a new Context
const CacheContext = React.createContext();

/**  @typedef {import('../classes/Student').StudentProps | import('../classes/Staff').StaffProps} UserProps */
/**  @typedef {import('../classes/Record').RecordProps} RecordProps */
/**  @typedef {import('../classes/Case').CaseProps} CaseProps */
/**  @typedef {import('../classes/Repository').RepositoryProps} RepositoryProps */
/**  @typedef {import('../classes/Organization').Organization} OrganizationProps */

/**
 * @typedef {{
 * 	user: UserProps | null;
 * 	cases: CaseProps[];
 * 	records: RecordProps[];
 * 	peers: UserProps[] | null;
 * 	repositories: RepositoryProps[] | null;
 * 	announcements: Object[];
 * }} Cache
 */
/** @typedef {(key: keyof Cache, data: Any) => Void} UpdateCache */
/** @typedef {(key: keyof Cache, data: Any, single: Boolean) => Void} PushToCache */
/** @typedef {(key: keyof Cache, favorKey: String, favorValue: String) => Void} GetFromCache */
/** @typedef {(key: keyof Cache, favorKey: String, favorValue: String) => Void} RemoveFromCache */
/** @typedef {(key: keyof Cache, favorKey: String, favorValue: String, data: Any) => Void} UpdateCacheItem */

// This is the custom hook that components will use to access the cache
/**
 * @type {() => {
 * 	cache: Cache;
 * 	updateCache: UpdateCache;
 * 	pushToCache: PushToCache;
 * 	getFromCache: GetFromCache;
 * 	removeFromCache: RemoveFromCache;
 * 	updateCacheItem: UpdateCacheItem;
 * }}
 */
const useCache = () => {
	const context = React.useContext(CacheContext);
	if (!context)
		throw new Error('useCache must be used within a CacheProvider');
	return context;
};

export const CacheProvider = ({ children }) => {
	// Use a single state object to hold all your cached data
	const [cache, setCache] = React.useState({
		user: null,
		records: [],
		cases: [],
		repositories: [],
		announcements: [],
		organizations: [],
		requests: [],
		peers: null
	});

	// A function to update the cache with new data
	/** @type {UpdateCache} */
	const updateCache = (key, data) =>
		setCache(prevCache => ({
			...prevCache,
			[key]: data
		}));

	/** @type {PushToCache} */
	const pushToCache = (key, data, single) =>
		setCache(prevCache => {
			const existingItems = prevCache[key];
			const newItems = single ? [data] : data;

			// Avoid duplicates by checking for matching 'id' property
			const merged = [
				...newItems,
				...existingItems.filter(
					item =>
						!newItems.some(
							newItem => newItem.id !== undefined && item.id === newItem.id
						)
				)
			];
			return {
				...prevCache,
				[key]: merged
			};
		});

	/** @type {GetFromCache} */
	const getFromCache = (key, favorKey, favorValue) => {
		const item = cache[key].find(item => item[favorKey] === favorValue);
		return item || null;
	};

	/** @type {RemoveFromCache} */
	const removeFromCache = (key, favorKey, favorValue) =>
		setCache(prevCache => ({
			...prevCache,
			[key]: prevCache[key].filter(item => item[favorKey] !== favorValue)
		}));

	/** @type {UpdateCacheItem} */
	const updateCacheItem = (key, favorKey, favorValue, data) =>
		setCache(prevCache => ({
			...prevCache,
			[key]: prevCache[key].map(item =>
				item[favorKey] === favorValue ? { ...item, ...data } : item
			)
		}));

	// Memoize the value to prevent unnecessary re-renders
	const value = React.useMemo(() => ({
		cache,
		updateCache,
		pushToCache,
		getFromCache,
		removeFromCache,
		updateCacheItem
	}), [cache]);

	return (
		<CacheContext.Provider value={value}>
			{children}
		</CacheContext.Provider>
	);
};

export { useCache, CacheContext };