import { Input as AntInput, Card, Flex, InputProps } from '@ant-design/react-native';

import theme from '../../styles/theme';

/**
 * @param {{ withError: Boolean, errorComponent: import('react').JSX.Element, required: Boolean } & InputProps} props
 */
const Input = (props) => {
	// Destructure the error prop
	const { withError, errorComponent, placeholder, required } = props;

	const newPlaceholder = required ? `${placeholder} *` : placeholder;

	return (
		<Flex direction='column' justify='center' align='stretch'>
			<Card style={{
				paddingHorizontal: theme.h_spacing_md,
				borderColor: withError ? theme.brand_error : theme.border_color_base,
				borderWidth: withError ? theme.border_width_lg : theme.border_width_md
			}}>
				<AntInput {...props} placeholder={newPlaceholder} />
			</Card>

			{withError && errorComponent}
		</Flex>
	);
};

export default Input;