import React from 'react';

import { Picker as RNPicker, PickerProps } from '@react-native-picker/picker';

import {
	Card,
	Flex
} from '@ant-design/react-native';

import theme from '../../styles/theme';

const { Item } = RNPicker;

/**
 * @param {{
 * 	withError: Boolean;
 * 	errorComponent: import('react').JSX.Element;
 * 	required: Boolean;
 * 	onChange: (value: String) => Void;
 * } & PickerProps} props
 */
const Picker = (props) => {
	// Destructure the error prop
	const { withError, errorComponent, placeholder, required } = props;

	const newPlaceholder = required ? `${placeholder} *` : placeholder;

	return (
		<Flex direction='column' justify='center' align='stretch'>
			<Card
				style={{
					borderColor: withError
						? theme.brand_error
						: theme.border_color_base,
					borderWidth: withError
						? theme.border_width_lg
						: theme.border_width_md,
					height: theme.button_height * 2
				}}
			>
				<RNPicker
					{...props}
					style={{
						height: theme.button_height * 2,
						color: props.selectedValue ? theme.color_text_base : theme.color_text_placeholder,
						fontSize: theme.button_font_size
					}}
					itemStyle={{
						height: theme.button_height * 2,
						fontSize: theme.button_font_size
					}}
					mode='dropdown'
					dropdownIconColor={theme.color_text_base}
					placeholder={newPlaceholder}
				>
					{!props.selectedValue && (
						<RNPicker.Item
							label={newPlaceholder}
							value={null}
							color={theme.color_text_placeholder}
						/>
					)}
					{props.children}
				</RNPicker>
			</Card>

			{withError && errorComponent}
		</Flex>
	);
};

Picker.Item = Item;
export default Picker;