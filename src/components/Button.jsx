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
 * 	outlined: Boolean;
 * } & ButtonProps} props
 * @returns {JSX.Element}
 */
const Button = (props) => {
	const { children, icon, outlined, type, size, style } = props;
	console.log(outlined);
	return (
		<AntButton
			style={{
				backgroundColor: outlined ? 'transparent' : type === 'primary' ? theme.brand_primary : theme.fill_base,
				borderColor: outlined ? theme.brand_primary : 'transparent',
				borderWidth: outlined ? 1 : 0,
				...style
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
			) : (
					icon && !children ? (
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
					)
			)}
		</AntButton>
	);
};

export default Button;
