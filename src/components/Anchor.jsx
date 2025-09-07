import React from 'react';
import { Text, TextProps, Linking } from 'react-native';

import theme from '../styles/theme';

import { navigationRef } from '../main';

/**
 * @param {{
 *  children: String;
 * 	href: String;
 * 	to: String;
 * } & TextProps} props
 * @returns {import('react').JSX.Element}
 */
const Anchor = (props) => {
	const { href, children, onPress, style, to, ...rest } = props;

	const [pressed, setPressed] = React.useState(false);

	return (
		<Text
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			onPress={
				onPress
					? onPress
					: () => {
							console.log('Navigating to:', to);
							if (to) navigationRef.current?.navigate(to);
							else Linking.openURL(href);
					  }
			}
			style={{
				color: !pressed ? theme.brand_primary : theme.brand_primary_tap,
				...style
			}}
			{...rest}
		>
			{children}
		</Text>
	);
};

export default Anchor;
