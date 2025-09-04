import React from 'react';
import { Text, TextProps, Pressable, Linking } from 'react-native';

import theme from '../styles/theme';

/**
 * @param {{
 *  children: String;
 * 	href: String;
 * } & TextProps} props
 * @returns {JSX.Element}
 */
const Anchor = (props) => {
	const { href, children, onPress, style, ...rest } = props;

	const [pressed, setPressed] = React.useState(false);

	return (
		<Text
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			onPress={onPress ? onPress : () => Linking.openURL(href)}
			style={[{ color: !pressed ? theme.brand_primary : theme.brand_primary_tap }, style]}
		>
			{children}
		</Text>
	);
};

export default Anchor;
