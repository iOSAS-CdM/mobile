import React from 'react';

import { Pressable } from 'react-native';

import { Icon } from '@ant-design/react-native';

import theme from '../styles/theme';

/**
 * @param {{
 * 	type: 'primary' | 'default';
 * 	size: 'small' | 'large' | 'default' | number;
 *  name: IconProps['name'];
 * 	outlined: Boolean;
 * }} props
 * @returns {JSX.Element}
 */
const IconButton = (props) => {
	const { name, outlined, type, size, style, ...rest } = props;

	const sizeIsNumber = typeof size === 'number';
	const newSize = sizeIsNumber
		? size
		: size === 'small'
		? theme.icon_size_sm
		: theme.icon_size_lg;

	const [pressed, setPressed] = React.useState(false);

	return (
		<Pressable
			onPressIn={() => setPressed(true)}
			onPressOut={() => setPressed(false)}
			style={{
				width: newSize,
				height: newSize,
				borderRadius:
					newSize >= theme.icon_size_lg
						? theme.radius_lg
						: theme.radius_sm,
				backgroundColor:
					type === 'primary'
						? pressed
							? theme.brand_primary_tap
							: theme.brand_primary
						: pressed
						? theme.fill_grey
						: theme.fill_base,
				borderColor: outlined ? theme.brand_primary : 'transparent',
				borderWidth: outlined ? 1 : 0,
				justifyContent: 'center',
				alignItems: 'center',
				...style
			}}
			{...rest}
		>
			<Icon
				name={name}
				style={{
					fontSize: newSize,
					color:
						type === 'primary'
							? pressed
								? theme.primary_button_fill
								: theme.color_text_base_inverse
							: pressed
							? theme.fill_tap
							: theme.color_icon_base
				}}
			/>
		</Pressable>
	);
};

export default IconButton;
