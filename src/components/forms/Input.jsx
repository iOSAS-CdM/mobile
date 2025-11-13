import React from 'react';
import { TextInput } from 'react-native-gesture-handler';

import { Input as AntInput, Flex, InputProps } from '@ant-design/react-native';

import { View } from 'react-native';

import theme from '../../styles/theme';

/**
 * @param {{
 * 	withError: Boolean;
 * 	errorComponent: import('react').JSX.Element;
 * 	wrapperStyle: Object;
 * 	required: Boolean;
 * 	placeholder: string;
 * 	required: Boolean;
 * } & typeof TextInput} props
 */
const Input = (props) => {
	// Destructure the error prop
	const { withError, errorComponent, placeholder, required } = props;

	const newPlaceholder = required ? `${placeholder} *` : placeholder;

	const [focused, setFocused] = React.useState(false);

	return (
		<Flex direction='column' justify='center' align='stretch' style={{ width: '100%', ...props.wrapperStyle }}>
			<View
				style={{
					paddingHorizontal: theme.h_spacing_md,
					borderColor: withError ? theme.brand_error : focused ? theme.brand_primary : theme.border_color_base,
					borderWidth: withError ? theme.border_width_lg : theme.border_width_md,
					borderRadius: theme.radius_md,
					backgroundColor: theme.fill_base
				}}
			>
				<TextInput
					{...props}
					style={{
						minHeight: theme.button_height,
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
				{props.suffix && <View style={{ position: 'absolute', right: theme.h_spacing_md, top: '50%', transform: [{ translateY: -12 }] }}>{props.suffix}</View>}
			</View>

			{withError && errorComponent}
		</Flex>
	);
};

export default Input;