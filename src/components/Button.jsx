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
 *  children: String,
 *  icon: IconProps['name']
 * } & ButtonProps} props
 * @returns {JSX.Element}
 */
const Button = (props) => {
	return (
		<AntButton {...props}>
			{props.icon ? (
				<Flex
					align='center'
					gap={
						props.size === 'small'
							? theme.button_font_size_sm / 2
							: theme.button_font_size / 2
					}
				>
					<Icon
						name={props.icon}
						style={{
							color:
								props.type === 'primary'
									? theme.color_text_base_inverse
									: theme.color_text_base
						}}
					/>
					<Text
						style={{
							color:
								props.type === 'primary'
									? theme.color_text_base_inverse
									: theme.color_text_base,
							fontSize:
								props.size === 'small'
									? theme.button_font_size_sm
									: theme.button_font_size
						}}
					>
						{props.children}
					</Text>
				</Flex>
			) : (
				props.children
			)}
		</AntButton>
	);
};

export default Button;
