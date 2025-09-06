import React from 'react';
import { Flex } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';

import theme from '../../../styles/theme';
const Home = () => {
	const [greeting, setGreeting] = React.useState(true);

	React.useLayoutEffect(() => {
		// morning, afternoon, evening
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) setGreeting('morning');
		else if (hour >= 12 && hour < 18) setGreeting('afternoon');
		else setGreeting('evening');
	}, []);

	return (
		<Flex
			direction='column'
			justify='flex-start'
			align='stretch'
			style={{ flex: 1 }}
		>
			<Flex
				direction='column'
				justify='flex-start'
				align='stretch'
				style={{ padding: 16, backgroundColor: theme.fill_base }}
			>
				<Text>{`Good ${greeting},`}</Text>
				<Flex direction='row' align='center' gap={8}>
					<Avatar
						size='large'
						uri='https://i.pravatar.cc/256'
					/>
					<Title level={2}>
						Danielle Craig
					</Title>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Home;
