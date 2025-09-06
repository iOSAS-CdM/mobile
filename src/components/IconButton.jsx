import React from 'react';

import { Pressable, View } from 'react-native';

import { IconOutline, OutlineGlyphMapType, IconFill, FillGlyphMapType } from '@ant-design/icons-react-native';

import theme from '../styles/theme';

/**
 * @typedef {{ iconType: 'outline', name: OutlineGlyphMapType}} OutlineProps
 * @typedef {{ iconType: 'filled', name: FillGlyphMapType}} FillProps
 * @typedef {OutlineProps | FillProps} IconProps
 */

/**
 * @param {{
 * 	type: 'primary' | 'default';
 * 	size: 'small' | 'large' | 'default' | number;
 * } & IconProps} props
 * @returns {JSX.Element}
 */
const IconButton = (props) => {
	const { name, iconType, type, size, style, ...rest } = props;

	const sizeIsNumber = typeof size === 'number';
	const newSize = sizeIsNumber
		? size
		: size === 'small'
		? theme.icon_size_sm
		: theme.icon_size_lg;

	const iconStyle = {
		fontSize: newSize,
		color:
			type === 'primary'
				? theme.color_text_base_inverse
				: theme.color_icon_base
	};
	return (
		<Pressable
			android_ripple={{ color: theme.fill_mask, borderless: true }}
			style={{
				width: newSize,
				height: newSize,
				borderRadius:
					newSize >= theme.icon_size_lg
						? theme.radius_lg
						: theme.radius_sm,
				backgroundColor:
					type === 'primary'
						? theme.brand_primary
						: theme.fill_base,
				borderColor: type === 'primary' ? theme.brand_primary : 'transparent',
				borderWidth: type === 'primary' ? 1 : 0,
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 10,
				...style
			}}
			{...rest}
		>
			{iconType === 'filled' ? (
				<IconFill
					name={name}
					style={iconStyle}
				/>
			) : (
				<IconOutline
					name={name}
						style={iconStyle}
				/>
			)}
		</Pressable>
	);
};

export default IconButton;
