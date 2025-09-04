import { Text, TextProps } from 'react-native';

import theme from '../styles/theme';

/**
 * @param {{
 *  children: String;
 * 	level: 1 | 2 | 3 | 4 | 5 | 6;
 * } & TextProps} props
 * @returns {JSX.Element}
 */
const Title = (props) => {
	const { level, children, style, ...rest } = props;

	const fontSize = level
		? theme[`title_font_size_${level}`]
		: theme.title_font_size_1;

	return (
		<Text style={[{ fontSize, color: theme.brand_primary, fontWeight: 'bold' }, style]} {...rest}>
			{children}
		</Text>
	);
};

export default Title;
