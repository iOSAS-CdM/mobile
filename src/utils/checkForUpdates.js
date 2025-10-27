import * as Updates from 'expo-updates';
import { Modal } from '@ant-design/react-native';

/**
 * Check for updates and download them in the background
 * This const is called on app startup
 */
export const checkForUpdates = async () => {
	// Skip update checks in development mode
	if (__DEV__) {
		console.log('⚠️ Updates disabled in development mode');
		return;
	};

	// Skip if updates are not enabled (e.g., running in Expo Go)
	if (!Updates.isEnabled) {
		console.log('⚠️ Updates are not enabled in this environment');
		return;
	};

	try {
		console.log('🔍 Checking for updates...');

		// Check if an update is available
		const update = await Updates.checkForUpdateAsync();

		if (update.isAvailable) {
			console.log('✅ Update available! Downloading...');

			// Download the update in the background
			await Updates.fetchUpdateAsync();

			console.log('✅ Update downloaded successfully!');

			// Show alert to user asking if they want to restart now or later
			Modal.alert(
				'Update Available',
				'A new version of the app has been downloaded. Would you like to restart the app now to apply the update?',
				[
					{
						text: 'Later',
						onPress: () => {
							console.log('📅 Update deferred - will apply on next restart');
						},
						style: 'cancel'
					},
					{
						text: 'Restart Now',
						onPress: async () => {
							console.log('🔄 Restarting app to apply update...');
							await Updates.reloadAsync();
						}
					}
				]
			);
		} else {
			console.log('✅ App is up to date');
		};
	} catch (error) {
		// Log the error but don't crash the app
		console.error('❌ Error checking for updates:', error);
	};
};

/**
 * Check for updates silently without showing an alert
 * Downloads update in background and applies on next restart
 */
export const checkForUpdatesSilent = async () => {
	if (__DEV__ || !Updates.isEnabled)
		return;

	try {
		const update = await Updates.checkForUpdateAsync();

		if (update.isAvailable) {
			console.log('✅ Update available! Downloading silently...');
			await Updates.fetchUpdateAsync();
			console.log('✅ Update downloaded - will apply on next restart');
		} else {
			console.log('✅ App is up to date');
		};
	} catch (error) {
		console.error('❌ Error checking for updates:', error);
	};
};

/**
 * Get current update information
 */
export const getUpdateInfo = () => ({
	isEnabled: Updates.isEnabled,
	channel: Updates.channel,
	runtimeVersion: Updates.runtimeVersion,
	updateId: Updates.updateId,
	createdAt: Updates.createdAt
});
