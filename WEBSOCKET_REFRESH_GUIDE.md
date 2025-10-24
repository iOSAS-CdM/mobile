# WebSocket Refresh Implementation

## Overview

This implementation allows your React Native app to listen for real-time refresh signals from the WebSocket server. When the server sends a refresh message, your components will automatically refresh their data.

## Server-Side Message Format

The server sends refresh messages in this format:

```js
{
  type: 'refresh',
  payload: {
    resource: 'records' | 'students' | 'cases' | null,  // null = broadcast to all
    timestamp: '2025-10-24T12:34:56.789Z'
  }
}
```

## Implementation Components

### 1. WebSocketContext (`src/contexts/WebSocketContext.jsx`)

Enhanced with a subscription system that allows components to listen for messages.

**Key Features:**
- `subscribe(callback)`: Subscribe to all WebSocket messages
- Returns an unsubscribe function for cleanup
- Notifies all subscribers when messages arrive

### 2. RefreshContext (`src/contexts/useRefresh.jsx`)

Automatically listens for WebSocket refresh messages and triggers app-wide refreshes.

**Key Features:**
- Automatically subscribes to WebSocket refresh messages
- Updates the refresh state when messages arrive
- Includes resource and timestamp information

### 3. useWebSocketRefresh Hook (`src/contexts/useWebSocketRefresh.jsx`)

A convenient hook for components to listen for specific resource refreshes.

## Usage Examples

### Example 1: Listen for Specific Resources (Recommended)

```jsx
import { useWebSocketRefresh } from '../../../contexts/useWebSocketRefresh';

const MyComponent = () => {
  const { setRefresh } = useRefresh();
  
  // Listen for refresh messages for 'records' and 'cases'
  useWebSocketRefresh(['records', 'cases'], ({ resource, timestamp }) => {
    console.log(`Refresh received for ${resource || 'all'}`);
    
    // Trigger your data refresh
    setRefresh({
      key: 'user',
      seed: Math.random(),
      source: 'websocket',
      resource
    });
  });

  return (
    // Your component JSX
  );
};
```

### Example 2: Listen for All Refreshes

```jsx
import { useWebSocketRefresh } from '../../../contexts/useWebSocketRefresh';

const MyComponent = () => {
  // Listen for all refresh messages (pass null as first argument)
  useWebSocketRefresh(null, ({ resource, timestamp }) => {
    console.log('Refresh signal received!');
    // Handle refresh
  });

  return (
    // Your component JSX
  );
};
```

### Example 3: Using WebSocketContext Directly

```jsx
import { useWebSocket } from '../../../contexts/WebSocketContext';

const MyComponent = () => {
  const ws = useWebSocket();

  React.useEffect(() => {
    if (!ws?.subscribe) return;

    const unsubscribe = ws.subscribe((message) => {
      if (message?.type === 'refresh') {
        const { resource, timestamp } = message.payload || {};
        console.log('Refresh:', resource, timestamp);
        // Handle refresh
      }
    });

    return unsubscribe;
  }, [ws]);

  return (
    // Your component JSX
  );
};
```

### Example 4: Real Implementation (Cases.jsx)

```jsx
const Cases = () => {
  const { cache } = useCache();
  const { setRefresh } = useRefresh();

  // Listen for WebSocket refresh messages for records and cases
  useWebSocketRefresh(['records', 'cases'], ({ resource, timestamp }) => {
    console.log(`Cases page: Received refresh for ${resource || 'all'} at ${timestamp}`);
    setRefresh({
      key: 'user',
      seed: Math.random(),
      source: 'websocket',
      resource
    });
  });

  // Rest of component...
};
```

## Configuration

### WebSocket URL Setup

The WebSocket URL is configured in `src/main.jsx`:

```jsx
const Entry = (props) => {
  const wsUrl = __DEV__ ? 'ws://10.242.192.28:3001' : 'ws://47.130.158.40/api';
  
  return (
    <KeyboardProvider>
      <WebSocketProvider url={wsUrl}>
        <RefreshProvider>
          <Main {...props} />
        </RefreshProvider>
      </WebSocketProvider>
    </KeyboardProvider>
  );
};
```

**Update the URLs to match your WebSocket server endpoints.**

## Provider Hierarchy

The providers are nested in this order:

```
KeyboardProvider
  └── WebSocketProvider
      └── RefreshProvider
          └── Main (your app)
```

This ensures:
1. WebSocket is available to RefreshProvider
2. RefreshProvider can listen to WebSocket messages
3. All components have access to refresh functionality

## Testing the Implementation

### 1. Check WebSocket Connection

```jsx
import { useWebSocket } from '../contexts/WebSocketContext';

const MyComponent = () => {
  const ws = useWebSocket();
  
  console.log('WebSocket connected:', ws.isConnected);
  
  return (
    <Text>Status: {ws.isConnected ? 'Connected' : 'Disconnected'}</Text>
  );
};
```

### 2. Test Manual Refresh Trigger

From your server, send a refresh message:

```js
// Server-side code
sendRefresh(null, 'records'); // Broadcast to all users for 'records' resource
sendRefresh(['user123'], 'cases'); // Send to specific user
sendRefresh(null); // Broadcast without specific resource
```

### 3. Check Console Logs

You should see logs like:
```
WebSocket connected
Received refresh signal: { resource: 'records', timestamp: '2025-10-24T12:34:56.789Z' }
Cases page: Received refresh for records at 2025-10-24T12:34:56.789Z
```

## Resource Types

Common resource types you might use:
- `'records'` - Student records/cases
- `'cases'` - Case reports
- `'students'` - Student data
- `'announcements'` - Announcements
- `'organizations'` - Organization data
- `null` - Broadcast to all (refresh everything)

## Benefits

1. **Real-time Updates**: Users see changes immediately without manual refresh
2. **Resource-Specific**: Only refresh relevant data, not everything
3. **Efficient**: Automatic cleanup of subscriptions
4. **Type-Safe**: Full TypeScript/JSDoc support
5. **Flexible**: Easy to add refresh listeners to any component

## Troubleshooting

### WebSocket Not Connecting

1. Check the WebSocket URL in `main.jsx`
2. Verify your server is running and accepting WebSocket connections
3. Check firewall/network settings
4. Look for error messages in console

### Not Receiving Refresh Messages

1. Verify WebSocket is connected: `ws.isConnected`
2. Check server is sending messages in correct format
3. Verify resource names match between server and client
4. Check console for any errors

### Refresh Not Triggering Data Update

1. Ensure your ContentPage or data fetching component respects the refresh state
2. Verify `setRefresh` is being called correctly
3. Check that cache keys match your expected values

## Next Steps

To implement refresh in other components:

1. Import `useWebSocketRefresh`
2. Specify which resources to listen for
3. Call `setRefresh` when refresh is received
4. Ensure your data fetching logic respects the refresh state
