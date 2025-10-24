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
			}
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

// eslint-disable-next-line react-refresh/only-export-components
export const useRefresh = () => React.useContext(RefreshContext);
