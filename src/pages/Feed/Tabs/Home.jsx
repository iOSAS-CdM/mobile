import React from 'react';
import { Flex } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';

import { UserContext } from '../Feed';

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

	/** @type {[import('../Feed').UserProps]} */
	const [user] = React.useContext(UserContext);

	return (
		<Flex
			direction='column'
			justify='flex-start'
			align='stretch'
			style={{ flex: 1 }}
		>
			{/***************************************** Greeting *****************************************/}
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
						uri={user?.profilePicture || user?.avatar || null}
					/>
					<Title level={2}>
						{`${user?.name?.first || ''} ${user?.name?.last || ''}`}
					</Title>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Home;
