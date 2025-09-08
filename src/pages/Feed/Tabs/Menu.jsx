
import { navigationRef } from '../../../main';

import supabase from '../../../utils/supabase';

import Button from '../../../components/Button';

const Menu = () => {
	const handleSignOut = async () => {
		supabase.auth.signOut();
		navigationRef.current?.navigate('SignIn');
	};

	return (
		<Button type='primary' onPress={handleSignOut}>Sign Out</Button>
	);
};

export default Menu;
