import React from 'react';
import { Flex } from '@ant-design/react-native';

import Text from '../../../components/Text';
import Title from '../../../components/Title';
import Avatar from '../../../components/Avatar';

import { useCache } from '../../../contexts/CacheContext';

import theme from '../../../styles/theme';
const Home = () => {
	const greeting = React.useMemo(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'morning';
		else if (hour >= 12 && hour < 18) return 'afternoon';
		else return 'evening';
	}, []);

	const { cache, updateCache, getCache } = useCache();

	/** @typedef {import('../../../contexts/CacheContext').UserProps} UserProps */
	/** @type {[UserProps, React.Dispatch<React.SetStateAction<UserProps | null>>]} */
	const [user, setUser] = React.useState(null);
	React.useEffect(() => {
		const user = getCache()['user'];
		if (user) return setUser(user);
		const fetchedUser = {
			name: { first: 'John', last: 'Doe' },
			profilePicture: 'https://i.pravatar.cc/256'
		};
		updateCache('user', fetchedUser);
		setUser(fetchedUser);
	}, [cache.user]);

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
						uri={user?.profilePicture}
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
