import React from 'react';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';

import Text from '../../../components/Text';

import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import theme from '../../../styles/theme';

const Cases = () => {
	const { cache } = useCache();
	const [records, setRecords] = React.useState();
	const id = cache.user?.id;
	React.useEffect(() => {
		const controller = new AbortController();

		(async () => {
			const [recordsResponse] = await Promise.all(
				authFetch(`${API_Route}/users/student/22-00250/records`, { signal: controller.signal })
			);
			if (!recordsResponse?.ok) return;

			const recordsData = await recordsResponse.json();
			console.log(recordsData);
			setRecords(recordsData.records);
		})();

	}, [id]);

	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={false}
					onRefresh={async () => {
						setRefresh({
							key: 'user',
							seed: Math.random()
						});
					}}
					colors={[theme.brand_primary]}
					tintColor={theme.brand_primary}
				/>
			}
		>
			<Text>{records && JSON.stringify(records)}</Text>
		</ScrollView>
	);
};

export default Cases;
