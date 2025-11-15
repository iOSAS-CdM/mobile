import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_Route } from '../main';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true
	})
});

/**
 * Request notification permissions from the user
 * @returns {Promise<boolean>} - True if permission granted
 */
export const requestNotificationPermissions = async () => {
	if (!Device.isDevice) {
		console.warn('Push notifications only work on physical devices');
		return false;
	};

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	};

	if (finalStatus !== 'granted') {
		console.log('Notification permission not granted');
		return false;
	};

	return true;
};

/**
 * Get the Expo Push Token for this device
 * @returns {Promise<string|null>} - The push token or null if failed
 */
export const getExpoPushToken = async () => {
	try {
		if (!Device.isDevice) {
			console.warn('Push notifications only work on physical devices');
			return null;
		};

		const projectId = Constants.expoConfig?.extra?.eas?.projectId;
		if (!projectId) {
			console.error('Missing EAS project ID in app.json');
			return null;
		};

		const token = await Notifications.getExpoPushTokenAsync({
			projectId,
		});

		return token.data;
	} catch (error) {
		// Handle Firebase not initialized error
		if (error.message && error.message.includes('FirebaseApp is not initialized')) {
			console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			console.warn('⚠️  FIREBASE NOT CONFIGURED');
			console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			console.warn('Push notifications require Firebase Cloud Messaging (FCM).');
			console.warn('');
			console.warn('Quick Setup:');
			console.warn('1. cd to your project directory');
			console.warn('2. Run: eas credentials');
			console.warn('3. Select: Android → Google Service Account');
			console.warn('4. Choose: "Let Expo handle it"');
			console.warn('5. Rebuild: eas build --platform android');
			console.warn('');
			console.warn('See FIREBASE_SETUP.md for detailed instructions.');
			console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			return null;
		};

		console.error('Error getting push token:', error);
		return null;
	};
};

/**
 * Register push token with the backend API
 * @param {string} token - The Expo push token
 * @param {string} accessToken - User's Supabase access token
 * @returns {Promise<boolean>} - True if successful
 */
export const registerPushToken = async (token, accessToken) => {
	try {
		const response = await fetch(`${API_Route}/push-tokens/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				token,
				platform: Platform.OS
			})
		});

		if (!response.ok) {
			const error = await response.json();
			console.error('Failed to register push token:', error);
			return false;
		};

		console.log('Push token registered successfully');
		return true;
	} catch (error) {
		console.error('Error registering push token:', error);
		return false;
	};
};

/**
 * Complete flow: Request permissions, get token, and register with API
 * @param {string} accessToken - User's Supabase access token
 * @returns {Promise<string|null>} - The push token if successful
 */
export const setupPushNotifications = async (accessToken) => {
	try {
		// Request permissions
		const hasPermission = await requestNotificationPermissions();
		if (!hasPermission) {
			console.log('Notification permissions not granted');
			return null;
		};

		// Get push token
		const token = await getExpoPushToken();
		if (!token) {
			console.log('Failed to get push token');
			return null;
		};

		// Register with backend
		const registered = await registerPushToken(token, accessToken);
		if (!registered) {
			console.log('Failed to register push token with backend');
			return null;
		};

		return token;
	} catch (error) {
		console.error('Error setting up push notifications:', error);
		return null;
	};
};

/**
 * Unregister push token when user signs out
 * @param {string} accessToken - User's Supabase access token
 * @returns {Promise<boolean>}
 */
export const unregisterPushToken = async (accessToken) => {
	try {
		const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

		const response = await fetch(`${API_Route}/push-tokens/unregister`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			console.error('Failed to unregister push token');
			return false;
		};

		console.log('Push token unregistered successfully');
		return true;
	} catch (error) {
		console.error('Error unregistering push token:', error);
		return false;
	};
};
