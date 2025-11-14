import supabase from './supabase';
import { navigationRef } from '../main';

/**
 * A fetch wrapper that includes the user's access token in the Authorization header.
 * If a 403/401 response is received, it signs the user out and navigates to SignIn.
 * @type  {typeof fetch}
 */
const authFetch = async (...args) => {
	// Use Supabase client's session instead of AsyncStorage
	const { data: { session } = {}, error: sessionError } = await supabase.auth.getSession();

	// Log warning if session retrieval failed
	if (sessionError)
		console.warn('authFetch: Failed to retrieve session:', sessionError.message);

	// Validate that we have a valid session with access token
	if (!session?.access_token) {
		const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
		console.warn('authFetch: No access token available for request to:', url);

		// Return a response indicating authentication is required
		return {
			ok: false,
			status: 401,
			statusText: 'Unauthorized - No access token',
			headers: {
				get: () => null
			},
			json: async () => ({ message: 'No authentication token available' }),
			text: async () => 'No authentication token available',
			clone: () => ({
				ok: false,
				status: 401,
				json: async () => ({ message: 'No authentication token available' }),
				text: async () => 'No authentication token available'
			})
		};
	};

	// Add Authorization header to the request
	try {
		// First arg is the resource/URL, second arg is options
		if (args[1] && typeof args[1] === 'object') {
			// If headers already exist, add to them
			args[1] = {
				...args[1],
				headers: {
					...(args[1].headers || {}),
					'Authorization': `Bearer ${session.access_token}`
				}
			};
		} else {
			// Create options object with headers if it doesn't exist
			args[1] = {
				headers: {
					'Authorization': `Bearer ${session.access_token}`
				}
			};
		};
	} catch (headerError) {
		console.error('authFetch: Failed to add Authorization header:', headerError);
		throw headerError;
	};

	try {
		const response = await fetch(...args);

		// If we have a session but get a 403/401 response, sign out
		if (response.status === 403 || response.status === 401) {
			await supabase.auth.signOut();
			console.log('unauthorized');
			navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
		};
		return response;
	} catch (err) {
		// Suppress AbortError (fetch aborted) so callers don't get noisy errors.
		// Treat other errors as before.
		if (err && (err.name === 'AbortError' || String(err).toLowerCase().includes('aborted'))) {
			// Return a minimal Response-like object so callers can still await json()/text()
			return {
				ok: false,
				status: 0,
				headers: {
					get: () => null
				},
				json: async () => null,
				text: async () => '',
				clone: () => ({ ok: false, status: 0, json: async () => null, text: async () => '' })
			};
		};
		throw err;
	};
};

export default authFetch;
