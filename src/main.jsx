import * as React from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

import {
	Text,
	SafeAreaView
} from 'react-native';

import Authentication from './pages/Authentication';

const RootStack = createNativeStackNavigator({
	screens: {
		Authentication: {
			screen: Authentication,
			options: { headerShown: false }
		}
	}
});

const Navigation = createStaticNavigation(RootStack);

const main = () => {
	return (
		<Navigation />
	);
};

export default main;
