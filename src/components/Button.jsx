import React from 'react';
import { Button as AntButton, ButtonProps } from '@ant-design/react-native';
import { Text } from 'react-native';

/**
 * Custom Button component
 * @type {React.FC<ButtonProps>}
 */
const Button = (props) => {
	return (
		<AntButton {...props}>
			<Text>{props.children}</Text>
		</AntButton>
	);
};

export default Button;