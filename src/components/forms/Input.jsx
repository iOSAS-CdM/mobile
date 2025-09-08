import React from 'react';

import { Input as AntInput, Card, Flex, InputProps } from '@ant-design/react-native';

import { View } from 'react-native';

import theme from '../../styles/theme';

/**
 * @param {{ withError: Boolean, errorComponent: import('react').JSX.Element, required: Boolean } & InputProps} props
 */
const Input = (props) => {
	// Destructure the error prop
	const { withError, errorComponent, placeholder, required } = props;

	const newPlaceholder = required ? `${placeholder} *` : placeholder;

	const [focused, setFocused] = React.useState(false);

	return (
		<Flex direction='column' justify='center' align='stretch'>
			<View
				style={{
					paddingHorizontal: theme.h_spacing_md,
					borderColor: withError ? theme.brand_error : focused ? theme.brand_primary : theme.border_color_base,
					borderWidth: withError ? theme.border_width_lg : theme.border_width_md,
					borderRadius: theme.radius_md,
					backgroundColor: theme.fill_base
				}}
			>
				<AntInput
					{...props}
					style={{
						height: theme.button_height,
						...props.style
					}}
					placeholder={newPlaceholder}
					onFocus={(e) => {
						props.onFocus?.(e);
						setFocused(true);
					}}
					onBlur={() => {
						props.onBlur?.();
						setFocused(false);
					}}
				/>
			</View>

			{withError && errorComponent}
		</Flex>
	);
};

export default Input;