import React from 'react';
import { Text as RNText, TextProps, Linking } from 'react-native';

import theme from '../styles/theme';

/**
 * @param {{
 *  children: String;
 * } & TextProps} props
 * @returns {JSX.Element}
 */
const Text = (props) => {
	const { children, style, ...rest } = props;

	return (
		<RNText
			style={[{ fontSize: theme.font_size_base }, style]}
			{...rest}
		>
			{children}
		</RNText>
	);
};

export default Text;
