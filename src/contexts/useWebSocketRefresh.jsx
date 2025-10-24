import React from 'react';
import { useWebSocket } from './WebSocketContext';

/**
 * Custom hook to listen for WebSocket refresh messages for specific resources
 * @param {string | string[]} resources - Resource name(s) to listen for (e.g., 'records', 'students', 'announcements')
 * @param {(data: { resource: string | null, timestamp: string }) => void} onRefresh - Callback when refresh is received
 * @returns {{ isConnected: boolean }} - WebSocket connection status
 * 
 * @example
 * ```js
 * // Listen for specific resource refreshes
 * useWebSocketRefresh(['records', 'cases'], ({ resource, timestamp }) => {
 *   console.log('Refresh received for:', resource);
 *   // Trigger your data refresh logic here
 * });
 * 
 * // Listen for all refreshes
 * useWebSocketRefresh(null, ({ resource, timestamp }) => {
 *   console.log('Refresh received');
 * });
 * ```
 */
export const useWebSocketRefresh = (resources, onRefresh) => {
	const ws = useWebSocket();

	React.useEffect(() => {
		if (!ws?.subscribe || !onRefresh) return;

		const resourceArray = resources === null
			? null
			: Array.isArray(resources)
				? resources
				: [resources];

		const unsubscribe = ws.subscribe((message) => {
			if (message?.type === 'refresh') {
				const { resource, timestamp } = message.payload || {};

				// If no specific resources requested, or resource matches, or it's a broadcast
				const shouldRefresh =
					resourceArray === null ||
					!resource ||
					resourceArray.includes(resource);

				if (shouldRefresh) {
					onRefresh({
						resource: resource || null,
						timestamp: timestamp || new Date().toISOString()
					});
				}
			}
		});

		return unsubscribe;
	}, [ws, resources, onRefresh]);

	return {
		isConnected: ws?.isConnected || false
	};
};
