import React from 'react';

import { navigationRef } from '../../../main';

import supabase from '../../../utils/supabase';

import Button from '../../../components/Button';

const Menu = () => {
	const [signingOut, setSigningOut] = React.useState(false);
	const handleSignOut = async () => {
		setSigningOut(true);
		await supabase.auth.signOut();
		setSigningOut(false);
		navigationRef.current?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
	};

	return (
		<Button type='primary' loading={signingOut} onPress={handleSignOut}>Sign Out</Button>
	);
};

export default Menu;
