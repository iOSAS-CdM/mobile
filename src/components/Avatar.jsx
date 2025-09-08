import React from 'react';
import { Image, ImageProps } from 'expo-image';

import { IconOutline } from '@ant-design/icons-react-native';

import theme from '../styles/theme';

/**
 * @param {{
 * 	size: 'small' | 'large' | 'default' | number;
 * 	uri: string;
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

	const [imageSource, setImageSource] = React.useState(null);
	React.useEffect(() => {
		const getSource = async () => {
			const request = fetch(typeof uri === 'string' ? uri : uri.uri);
			const response = await request;
			if (response.ok)
				setImageSource({ uri });
			else
				setImageSource(null);
		};
		getSource();
	}, [uri]);

	return (
		<>
			{false ? (
				<Image
					source={imageSource}
					style={{
						width: newSize,
						height: newSize,
						borderRadius: newSize >= theme.icon_size_lg ? theme.radius_lg : theme.radius_sm,
						backgroundColor: theme.fill_base,
						...style
					}}
					contentFit='cover'
					{...rest}
				/>
			) : (
				<SkeletonLoading>
					<IconOutline
						name='user'
						style={{
							width: newSize,
							height: newSize,
							fontSize: newSize * 0.6,
							borderRadius: newSize >= theme.icon_size_lg ? theme.radius_lg : theme.radius_sm,
							backgroundColor: theme.fill_base,
							color: theme.color_icon_base,
							textAlign: 'center',
							textAlignVertical: 'center',
							...style
						}}
					/>
				</SkeletonLoading>
			)}
		</>
	);
};

export default Avatar;