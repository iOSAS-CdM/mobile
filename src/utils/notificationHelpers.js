import authFetch from './authFetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Send push notifications to specific users
 * @param {Object} options
 * @param {string[]} options.userIds - Array of user IDs to send to
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Custom data (e.g., screen to navigate to)
 * @returns {Promise<Object>}
 */
export const sendNotificationToUsers = async ({ userIds, title, body, data }) => {
	try {
		const response = await authFetch(`${API_URL}/push-tokens/send`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userIds,
				title,
				body,
				data: data || {}
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to send notification');
		};

		return await response.json();
	} catch (error) {
		console.error('Error sending notification to users:', error);
		throw error;
	};
};

/**
 * Send push notifications to users by role
 * @param {Object} options
 * @param {string[]} options.roles - Array of roles ('student', 'staff', 'superadmin')
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Custom data (e.g., screen to navigate to)
 * @returns {Promise<Object>}
 */
export const sendNotificationToRoles = async ({ roles, title, body, data }) => {
	try {
		const response = await authFetch(`${API_URL}/push-tokens/send`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				roles,
				title,
				body,
				data: data || {}
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to send notification');
		};

		return await response.json();
	} catch (error) {
		console.error('Error sending notification to roles:', error);
		throw error;
	};
};

/**
 * Get my push token
 * @returns {Promise<Object>}
 */
export const getMyPushToken = async () => {
	try {
		const response = await authFetch(`${API_URL}/push-tokens/my-token`);

		if (!response.ok) {
			if (response.status === 404)
				return null; // No token found
			const error = await response.json();
			throw new Error(error.message || 'Failed to fetch push token');
		};

		const result = await response.json();
		return result.data;
	} catch (error) {
		console.error('Error fetching push token:', error);
		throw error;
	};
};
