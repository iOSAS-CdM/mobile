import React from 'react';

/**
 * @typedef {Object} WebSocketContextValue
 * @property {boolean} isConnected - Whether the WebSocket is currently connected
 * @property {any} lastMessage - The last message received from the WebSocket
 * @property {(message: string | Object, timeout?: number) => Promise<boolean>} sendMessage - Send a message through the WebSocket (waits for connection)
 * @property {() => void} disconnect - Disconnect the WebSocket connection
 * @property {() => void} reconnect - Manually trigger a reconnection
 * @property {(callback: (message: any) => void) => () => void} subscribe - Subscribe to WebSocket messages
 */

/**
 * @type {React.Context<WebSocketContextValue | null>}
 */
const WebSocketContext = React.createContext(null);

/**
 * WebSocket Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.url - WebSocket server URL
 * @returns {React.ReactElement}
 */
export const WebSocketProvider = ({ children, url }) => {
	const [isConnected, setIsConnected] = React.useState(false);
	const [lastMessage, setLastMessage] = React.useState(null);
	const ws = React.useRef(null);
	const reconnectTimeout = React.useRef(null);
	const reconnectAttempts = React.useRef(0);
	const maxReconnectAttempts = 5;
	const reconnectDelay = 3000;
	const subscribers = React.useRef(new Set());

	/**
	 * Establishes WebSocket connection
	 * @private
	 */
	const connect = () => {
		if (!url) {
			console.warn('WebSocket URL not provided');
			return;
		};

		try {
			ws.current = new WebSocket(url);

			ws.current.onopen = () => {
				console.log('WebSocket connected');
				setIsConnected(true);
				reconnectAttempts.current = 0;
			};

			ws.current.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					setLastMessage(data);
					for (const callback of subscribers.current) {
						try {
							callback(data);
						} catch (error) {
							console.error('Error in WebSocket subscriber:', error);
						};
					};
				} catch (error) {
					setLastMessage(event.data);
					for (const callback of subscribers.current) {
						try {
							callback(event.data);
						} catch (error) {
							console.error('Error in WebSocket subscriber:', error);
						};
					};
				};
			};

			ws.current.onerror = (error) => {
				console.error('WebSocket error:', error);
			};

			ws.current.onclose = () => {
				console.log('WebSocket disconnected');
				setIsConnected(false);

				// Attempt to reconnect
				if (reconnectAttempts.current < maxReconnectAttempts) {
					reconnectAttempts.current += 1;
					console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
					reconnectTimeout.current = setTimeout(() => {
						connect();
					}, reconnectDelay);
				} else {
					console.log('Max reconnection attempts reached');
				};
			};
		} catch (error) {
			console.error('Failed to create WebSocket connection:', error);
		};
	};

	/**
	 * Closes WebSocket connection and clears reconnection timeout
	 * @private
	 */
	const disconnect = () => {
		if (reconnectTimeout.current) {
			clearTimeout(reconnectTimeout.current);
		};
		if (ws.current) {
			ws.current.close();
			ws.current = null;
		};
	};

	/**
	 * Sends a message through the WebSocket connection
	 * Waits for connection to be established if not yet connected
	 * @param {string | Object} message - Message to send (will be stringified if object)
	 * @param {number} [timeout=5000] - Maximum time to wait for connection (ms)
	 * @returns {Promise<boolean>} - True if message was sent, false if failed or timeout
	 */
	const sendMessage = async (message, timeout = 5000) => {
		const startTime = Date.now();

		// Wait for connection to be established
		while (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
			if (Date.now() - startTime > timeout) {
				console.warn('WebSocket connection timeout');
				return false;
			};
			// Wait 100ms before checking again
			await new Promise(resolve => setTimeout(resolve, 100));
		};

		try {
			const data = typeof message === 'string' ? message : JSON.stringify(message);
			ws.current.send(data);
			return true;
		} catch (error) {
			console.error('Failed to send message:', error);
			return false;
		};
	};

	/**
	 * Subscribe to WebSocket messages
	 * @param {(message: any) => void} callback - Function to call when a message is received
	 * @returns {() => void} Unsubscribe function
	 */
	const subscribe = (callback) => {
		subscribers.current.add(callback);
		// Return unsubscribe function
		return () => {
			subscribers.current.delete(callback);
		};
	};

	React.useEffect(() => {
		connect();

		return () => {
			disconnect();
		};
	}, [url]);

	const value = {
		isConnected,
		lastMessage,
		sendMessage,
		disconnect,
		reconnect: connect,
		subscribe,
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};

/**
 * Custom hook to access WebSocket context
 * @returns {WebSocketContextValue} WebSocket context value
 * @throws {Error} If used outside of WebSocketProvider
 */
export const useWebSocket = () => {
	const context = React.useContext(WebSocketContext);
	if (!context) {
		throw new Error('useWebSocket must be used within a WebSocketProvider');
	};
	return context;
};
