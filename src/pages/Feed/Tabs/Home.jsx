import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
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
	const [user, setUser] = React.useState(null);
	React.useEffect(() => {
		const user = getCache()['user'];
		if (user) return setUser(user);
		const fetchedUser = {
			role: 'student',
			id: '22-00250',
			name: {
				first: 'Danielle',
				last: 'Craig'
			},
			email: 'danielle.craig@gmail.com',
			institute: 'ics',
			program: 'BSIT',
			year: 3,
			phone: '+63 912 345 6789',
			profilePicture: 'https://i.pravatar.cc/256',
			status: 'active',
			organizations: []
		};
		updateCache('user', fetchedUser);
		setUser(fetchedUser);
	}, [cache.user]);

	return (
		<ScrollView>
			<Flex
				direction='column'
				justify='flex-start'
				align='stretch'
			>
				{/***************************************** Greeting *****************************************/}
				<Flex
					direction='column'
					justify='flex-start'
					align='stretch'
					style={{ padding: 16, backgroundColor: theme.fill_base }}
				>
					<Text>{greeting ? `Good ${greeting},` : 'Hello,'}</Text>
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
		</ScrollView>
	);
};

export default Home;
