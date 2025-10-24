import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, url }) => {
	const [isConnected, setIsConnected] = useState(false);
	const [lastMessage, setLastMessage] = useState(null);
	const ws = useRef(null);
	const reconnectTimeout = useRef(null);
	const reconnectAttempts = useRef(0);
	const maxReconnectAttempts = 5;
	const reconnectDelay = 3000;

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
				} catch (error) {
					setLastMessage(event.data);
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

	const disconnect = () => {
		if (reconnectTimeout.current) {
			clearTimeout(reconnectTimeout.current);
		};
		if (ws.current) {
			ws.current.close();
			ws.current = null;
		};
	};

	const sendMessage = (message) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			const data = typeof message === 'string' ? message : JSON.stringify(message);
			ws.current.send(data);
			return true;
		} else {
			console.warn('WebSocket is not connected');
			return false;
		};
	};

	useEffect(() => {
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
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error('useWebSocket must be used within a WebSocketProvider');
	};
	return context;
};
