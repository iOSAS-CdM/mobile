import { Text, TextProps } from 'react-native';

import theme from '../styles/theme';

/**
 * @param {{
 *  children: string;
 * 	level: 1 | 2 | 3 | 4 | 5 | 6;
 * 	center: Boolean;
 * } & TextProps} props
 * @returns {import('react').JSX.Element}
 */
const Title = (props) => {
	const { level, center, children, style, ...rest } = props;

	const fontSize = level
		? theme[`title_font_size_${level}`]
		: theme.title_font_size_1;

	return (
		<Text style={{
			fontSize,
			color: theme.brand_primary,
			fontWeight: 'bold',
			textAlign: center ? 'center' : 'left',
			...style
		}} {...rest}>
			{children}
		</Text>
	);
};

export default Title;
