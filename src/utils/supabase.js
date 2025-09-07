import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhtmwpsndcqnncskpspz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodG13cHNuZGNxbm5jc2twc3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDkwNjcsImV4cCI6MjA3MTM4NTA2N30.D1OA-8-4jyWiHnn-nUN1WNSZcESeRxp4rYeRhecJZjE';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		lock: processLock
	}
});

// only be registered once.
if (Platform.OS !== 'web') {
	AppState.addEventListener('change', (state) => {
		if (state === 'active')
			supabase.auth.startAutoRefresh();
		else
			supabase.auth.stopAutoRefresh();
	});
};

export default supabase;