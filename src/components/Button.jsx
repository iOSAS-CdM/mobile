import React from 'react';

import {
	Button as AntButton,
	ButtonProps,
	Icon,
	IconProps,
	Text,
	Flex
} from '@ant-design/react-native';

import theme from '../styles/theme';

/**
 * @param {{
 *  children: String;
 *  icon: IconProps['name'];
 * 	onPress: Promise<Void>;
 * } & ButtonProps} props
 * @returns {import('react').JSX.Element}
 */
const Button = (props) => {
	const { children, icon, type, size, style, onPress } = props;

	const [loading, setLoading] = React.useState(false);

	return (
		<AntButton
			loading={loading}
			style={{
				backgroundColor:
					type === 'primary' ? theme.brand_primary : theme.fill_base,
				...style
			}}
			disabled={loading}
			onPress={async () => {
				setLoading(true);
				try {
					await onPress?.();
				} catch (error) {
					console.error('Error occurred while pressing button:', error);
				} finally {
					setLoading(false);
				}
			}}
			{...props}
		>
			{icon && children ? (
				<Flex
					align='center'
					gap={
						size === 'small'
							? theme.button_font_size_sm / 2
							: theme.button_font_size / 2
					}
				>
					<Icon
						name={icon}
						style={{
							color:
								type === 'primary'
									? theme.color_text_base_inverse
									: theme.color_text_base
						}}
					/>
					<Text
						style={{
							color:
								type === 'primary'
									? theme.color_text_base_inverse
									: theme.color_text_base,
							fontSize:
								size === 'small'
									? theme.button_font_size_sm
									: theme.button_font_size
						}}
					>
						{children}
					</Text>
				</Flex>
			) : icon && !children ? (
				<Icon
					name={icon}
					style={{
						color:
							type === 'primary'
								? theme.color_text_base_inverse
								: theme.color_text_base
					}}
				/>
			) : (
				children
			)}
		</AntButton>
	);
};

export default Button;
