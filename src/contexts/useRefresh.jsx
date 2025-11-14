import React from 'react';
import { useWebSocket } from './WebSocketContext';

const RefreshContext = React.createContext(null);

/**
 * @type {React.FC<React.PropsWithChildren>}
 */
export const RefreshProvider = ({ children }) => {
	const [refresh, setRefresh] = React.useState(null);
	const ws = useWebSocket();

	// Listen for WebSocket refresh messages
	React.useEffect(() => {
		if (!ws?.subscribe) return;

		const unsubscribe = ws.subscribe((message) => {
			// Check if this is a refresh message
			if (message?.type === 'refresh') {
				const { resource, timestamp } = message.payload || {};
				console.log('Received refresh signal:', { resource, timestamp });

				// Trigger refresh with resource information
				setRefresh({
					key: resource || 'all',
					seed: Math.random(),
					timestamp: timestamp || new Date().toISOString(),
					source: 'websocket'
				});
			};
		});

		return unsubscribe;
	}, [ws]);

	const value = React.useMemo(() => ({ refresh, setRefresh }), [refresh]);

	return (
		<RefreshContext.Provider value={value}>
			{children}
		</RefreshContext.Provider>
	);
};

/**
 * @typedef {Object} RefreshContext
 * @property {Object|null} refresh - The current refresh state containing resource information and timing
 * @property {string} [refresh.key] - The resource key to refresh (e.g., 'all', 'cases', 'announcements')
 * @property {number} refresh.seed - A random seed value to force component re-renders
 * @property {string} refresh.timestamp - ISO timestamp of when the refresh was triggered
 * @property {string} refresh.source - Source of the refresh signal (e.g., 'websocket', 'manual')
 * @property {Function} setRefresh - Function to manually trigger a refresh with custom parameters
 */

/**
 * Hook to access the refresh context for managing data synchronization
 * @returns {RefreshContext} The refresh context containing refresh state and setRefresh function
 * @example
 * const { refresh, setRefresh } = useRefresh();
 * 
 * // Listen to refresh events
 * React.useEffect(() => {
 *   if (refresh?.key === 'cases') {
 *     // Refetch cases data
 *   }
 * }, [refresh]);
 * 
 * // Manually trigger a refresh
 * setRefresh({
 *   key: 'announcements',
 *   seed: Math.random(),
 *   timestamp: new Date().toISOString(),
 *   source: 'manual'
 * });
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useRefresh = () => React.useContext(RefreshContext);
