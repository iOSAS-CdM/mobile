import React from 'react';

import { Dropdown } from 'react-native-element-dropdown';

import { View } from 'react-native';

import {
	Card,
	Flex
} from '@ant-design/react-native';

import theme from '../../styles/theme';

/**
 * @param {{
 * 	withError: Boolean;
 * 	errorComponent: import('react').JSX.Element;
 * 	required: Boolean;
 * 	onChange: (value: String) => Void;
 * } & import('react-native-element-dropdown/src/components/Dropdown/model').DropdownProps} props
 */
const Picker = (props) => {
	// Destructure the error prop
	const { withError, errorComponent, placeholder, required } = props;

	const newPlaceholder = required ? `${placeholder} *` : placeholder;

	return (
		<Flex direction='column' justify='center' align='stretch'>
			<View
				style={{
					height: theme.button_height * 1.5,
					paddingHorizontal: theme.h_spacing_md,
					borderColor: withError ? theme.brand_error : theme.border_color_base,
					borderWidth: withError ? theme.border_width_lg : theme.border_width_md,
					borderRadius: theme.radius_md,
					backgroundColor: theme.fill_base
				}}
			>
				<Dropdown
					{...props}
					style={{
						height: theme.button_height * 1.5,
						borderColor: 'transparent',
						color: props.value ? theme.color_text_base : theme.color_text_placeholder,
						fontSize: theme.button_font_size
					}}
					placeholderStyle={{ color: theme.color_text_placeholder, fontSize: theme.button_font_size }}
					selectedTextStyle={{ color: theme.color_text_base, fontSize: theme.button_font_size }}
					itemTextStyle={{ color: theme.color_text_base, fontSize: theme.button_font_size }}
					dropdownPosition='bottom'
					placeholder={newPlaceholder}
					value={props.value}
					onChangeText={(event) => {
						if (!event) return;
						props?.onChange?.(event);
					}}
				/>
			</View>

			{withError && errorComponent}
		</Flex>
	);
};

export default Picker;