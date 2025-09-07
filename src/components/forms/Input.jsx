import React from 'react';
import { FieldError } from 'react-hook-form';

import { Input as AntInput, Card, Flex, InputProps } from '@ant-design/react-native';

import theme from '../../styles/theme';

/**
 * @param {{ withError: Boolean, errorComponent: import('react').JSX.Element } & InputProps} props
 */
const Input = (props) => {
	// Destructure the error prop
	const { withError, errorComponent } = props;

	return (
		<Flex direction='column' justify='center' align='stretch'>
			<Card style={{ borderColor: withError ? theme.brand_error : theme.border_color_base, borderWidth: withError ? theme.border_width_lg : theme.border_width_md }}>
				<AntInput {...props} />

			</Card>
			{withError && errorComponent}
		</Flex>
	);
};

export default Input;