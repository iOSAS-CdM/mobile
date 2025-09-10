
import { navigationRef } from '../../../main';

import supabase from '../../../utils/supabase';

import Button from '../../../components/Button';

const Menu = () => {
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
	};

	return (
		<Button type='primary' onPress={handleSignOut}>Sign Out</Button>
	);
};

export default Menu;
