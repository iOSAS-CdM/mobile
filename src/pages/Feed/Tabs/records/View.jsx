import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';

import { ScrollView } from 'react-native-gesture-handler';
import { TouchableWithoutFeedback, Keyboard, Platform, View, Linking } from 'react-native';

import { Flex, Tag } from '@ant-design/react-native';

import Text from '../../../../components/Text';
import Button from '../../../../components/Button';
import IconButton from '../../../../components/IconButton';
import Input from '../../../../components/forms/Input';
import Picker from '../../../../components/forms/Picker';

import { navigationRef } from '../../../../main';

import authFetch from '../../../../utils/authFetch';
import { API_Route } from '../../../../main';

import theme from '../../../../styles/theme';

/**
 * @type {React.FC<{
 * 	route: import('@react-navigation/native').RouteProp<any, 'ViewRecord'>;
 * }>}
 */
const New = ({ route }) => {
	/** @type {import('../../../../classes/Record').RecordProps | null} */
	const recordData = route.params?.recordData || null;
};

export default New;
