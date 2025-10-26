import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import theme from '../styles/theme';

/**
 * A skeleton loading component with animation
 * @param {{
 *  width?: number | string;
 *  height?: number;
 *  borderRadius?: number;
 *  style?: import('react-native').ViewStyle;
 * }} props
 * @returns {JSX.Element}
 */
const Skeleton = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
	const animatedValue = React.useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(animatedValue, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(animatedValue, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		);

		animation.start();

		return () => animation.stop();
	}, [animatedValue]);

	const opacity = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0.3, 0.7],
	});

	return (
		<Animated.View
			style={[
				styles.skeleton,
				{
					width,
					height,
					borderRadius,
					opacity,
				},
				style
			]}
		/>
	);
};

const styles = StyleSheet.create({
	skeleton: {
		backgroundColor: theme.fill_base
	},
});

export default Skeleton;