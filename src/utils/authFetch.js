import supabase from './supabase';
import { navigationRef } from '../main';

/**
 * A fetch wrapper that includes the user's access token in the Authorization header.
 * If a 403/401 response is received, it signs the user out and navigates to SignIn.
 * @type  {typeof fetch}
 */
const authFetch = async (...args) => {
	// Use Supabase client's session instead of AsyncStorage
	const { data: { session } = {} } = await supabase.auth.getSession();

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
		}
	}

	const response = await fetch(...args);

	// If we have a session but get a 403/401 response, sign out
	if (response.status === 403 || response.status === 401) {
		await supabase.auth.signOut();
		console.log('unauthorized');
		navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
	}
	return response;
};

export default authFetch;
