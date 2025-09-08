import React from 'react';
import { Image, ImageProps } from 'expo-image';

import { IconOutline } from '@ant-design/icons-react-native';

import theme from '../styles/theme';

/**
 * @param {{
 * 	size: 'small' | 'large' | 'default' | number;
 * 	uri: String;
 * } & ImageProps} props
 */
const Avatar = (props) => {
	const { size, uri, style, ...rest } = props;

	const sizeIsNumber = typeof size === 'number';
	const newSize = sizeIsNumber
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
					name='user'
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