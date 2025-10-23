
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from './supabase';
import { navigationRef } from '../main';

/**
 * A fetch wrapper that includes the user's access token in the Authorization header.
 * If a 403 Forbidden response is received, it signs the user out and navigates to SignUp.
 * @param  {input: URL | RequestInfo, init?: RequestInit} args - Arguments to pass to fetch (url, options)
 * @returns {Promise<Response>} - The fetch response
 */
const authFetch = async (...args) => {
	const AllAsyncStorageKeys = await AsyncStorage.getAllKeys();
	const sessionKey = AllAsyncStorageKeys.find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
	const sessionstring = sessionKey ? await AsyncStorage.getItem(sessionKey) : null;
	/** @type {import('@supabase/supabase-js').Session | null} */
	const session = sessionstring ? JSON.parse(sessionstring) : null;
	if (session?.access_token) {
		// First arg is the resource/URL, second arg is options
		if (args[1] && typeof args[1] === 'object') {
			// If headers already exist, add to them
			args[1].headers = {
				...args[1].headers,
				'Authorization': `Bearer ${session.access_token}`
			};
		} else {
			// Create headers object if options doesn't exist
			args[1] = {
				...(args[1] || {}),
				headers: {
					'Authorization': `Bearer ${session.access_token}`
				}
			};
		};
	};

	const response = await fetch(...args);

	// If we have a session but get a 403 Forbidden response, sign out
	if (response.status === 403 || response.status === 401) {
		await supabase.auth.signOut();
		console.log('unauthorized')
		navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
	};
	return response;
};

export default authFetch;