import React from 'react';
import { Image, ImageProps } from 'expo-image';

import { IconOutline } from '@ant-design/icons-react-native';

import theme from '../styles/theme';

/**
 * @param {{
 * 	size: 'small' | 'large' | 'default' | number;
 * 	icon?: import('@ant-design/icons-react-native').IconOutlineProps['name'];
 * 	uri: string;
 * } & ImageProps} props
 */
const Avatar = (props) => {
	const { size, uri, icon, style, ...rest } = props;

	const sizeIsnumber = typeof size === 'number';
	const newSize = sizeIsnumber
		? size
		: size === 'small'
			? theme.icon_size_sm
			: theme.icon_size_lg;

	const [failed, setFailed] = React.useState(false);

	return (
		<>
			{!failed ? (
				<Image
					source={uri}
					onError={() => setFailed(true)}
					style={{
						width: newSize,
						height: newSize,
						borderRadius: newSize >= theme.icon_size_lg ? theme.radius_lg : theme.radius_sm,
						backgroundColor: theme.fill_body,
						...style
					}}
					contentFit='cover'
					{...rest}
				/>
			) : (
				<IconOutline
					name={props.icon || 'user'}
					style={{
						width: newSize,
						height: newSize,
						fontSize: newSize * 0.6,
						borderRadius: newSize >= theme.icon_size_lg ? theme.radius_lg : theme.radius_sm,
						backgroundColor: theme.fill_body,
						color: theme.color_icon_base,
						textAlign: 'center',
						textAlignVertical: 'center',
						...style
					}}
				/>
			)}
		</>
	);
};

export default Avatar;