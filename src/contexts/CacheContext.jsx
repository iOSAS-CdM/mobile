// src/contexts/CacheContext.js
import React from 'react';

// Create a new Context
const CacheContext = React.createContext();

/**  @typedef {import('../classes/Student').StudentProps | import('../classes/Staff').StaffProps} UserProps */

/**
 * @typedef {{
 * 	user: UserProps | null;
 * 	highlights: Object[] | null;
 * 	peers: UserProps[] | null;
 * }} Cache
 */
/** @typedef {(key: keyof Cache, data: Any) => void} UpdateCache */
/** @typedef {() => Cache} GetCache */

// This is the custom hook that components will use to access the cache
/**
 * @type {() => {
 * 	cache: Cache;
 * 	updateCache: UpdateCache;
 * 	getCache: GetCache;
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
		highlights: null,
		peers: null
	});

	// A function to update the cache with new data
	/** @type {UpdateCache} */
	const updateCache = (key, data) =>
		setCache(prevCache => ({
			...prevCache,
			[key]: data
		}));

	// A function to check the cache for an item
	/** @type {GetCache} */
	const getCache = () =>
		cache;

	// Memoize the value to prevent unnecessary re-renders
	const value = React.useMemo(() => ({
		cache,
		updateCache,
		getCache
	}), [cache]);

	return (
		<CacheContext.Provider value={value}>
			{children}
		</CacheContext.Provider>
	);
};

export { useCache, CacheContext };