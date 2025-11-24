import React from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { ActivityIndicator, Flex } from '@ant-design/react-native';

import Text from '../../../components/Text';
import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/useRefresh';
import authFetch from '../../../utils/authFetch';
import { API_Route, navigationRef } from '../../../main';
import theme from '../../../styles/theme';

const colors = {
	announcement: theme.brand_primary || '#1677ff',
	record: theme.brand_warning || '#fa8c16'
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toISODate = (input) => {
	if (!input) return null;
	if (typeof input === 'string' && ISO_DATE_REGEX.test(input.trim()))
		return input.trim().slice(0, 10);

	const dt = new Date(input);
	if (Number.isNaN(dt.getTime())) return null;
	const pad = (n) => String(n).padStart(2, '0');
	return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
};

const normalizeEvents = (announcements = [], records = []) => {
	const normalized = [];

	for (const a of announcements) {
		let sourceDate;
		if (a?.type === 'event' && a?.event_date) {
			sourceDate = a.event_date;
		} else {
			sourceDate = a?.created_at || a?.createdAt || a?.created || a?.date;
		}

		const iso = toISODate(sourceDate);
		if (!iso) {
			console.warn('Invalid date for announcement:', a?.id, sourceDate);
			continue;
		}

		normalized.push({
			id: a?.id,
			type: 'announcement',
			title: a?.title || a?.description || 'Announcement',
			date: iso,
			raw: a,
			cover: a?.cover ? { uri: a.cover } : null
		});
	}

	for (const r of records) {
		const iso = toISODate(r?.date || r?.created_at || r?.createdAt || r?.created);
		if (!iso) {
			console.warn('Invalid date for record:', r?.id, r?.date || r?.created_at || r?.createdAt || r?.created);
			continue;
		}

		normalized.push({
			id: r?.id,
			type: 'record',
			title: r?.title || r?.violation || 'Record',
			date: iso,
			raw: r
		});
	}

	return normalized;
};

const areEventsEqual = (prev = [], next = []) => {
	if (prev === next) return true;
	if (!Array.isArray(prev) || !Array.isArray(next) || prev.length !== next.length)
		return false;

	for (let i = 0; i < prev.length; i += 1) {
		const a = prev[i];
		const b = next[i];
		if (!a || !b) return false;
		if (a.id !== b.id || a.type !== b.type || a.date !== b.date || a.title !== b.title)
			return false;
		const coverA = a.cover?.uri ?? null;
		const coverB = b.cover?.uri ?? null;
		if (coverA !== coverB) return false;
		if (a.raw !== b.raw) return false;
	}

	return true;
};

const Calendar = () => {
	const { cache, pushToCache, updateCacheItem } = useCache();
	const { refresh, setRefresh } = useRefresh();
	const [loading, setLoading] = React.useState(true);
	const [selectedDate, setSelectedDate] = React.useState(() => {
		const d = new Date();
		// Use local date string to avoid timezone shifts when converting to ISO
		const pad = (n) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	});
	const [events, setEvents] = React.useState([]);

	const pushToCacheRef = React.useRef(pushToCache);
	React.useEffect(() => {
		pushToCacheRef.current = pushToCache;
	}, [pushToCache]);

	const announcements = cache.announcements || [];
	const records = cache.records || [];
	const userId = cache.user?.id;

	const commitEvents = React.useCallback((nextEvents) => {
		setEvents((prev) => (areEventsEqual(prev, nextEvents) ? prev : nextEvents));
	}, []);

	React.useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		const load = async () => {
			const refreshKey = refresh?.key;
			const shouldForceRefresh = (() => {
				if (!refresh) return false;
				if (!refreshKey || refreshKey === 'all') return true;
				return ['calendar', 'announcements', 'records'].includes(refreshKey);
			})();

			const needsAnnouncements = shouldForceRefresh || announcements.length === 0;
			const needsRecords = shouldForceRefresh || (records.length === 0 && !!userId);

			if (!needsAnnouncements && !needsRecords) {
				if (mounted) {
					commitEvents(normalizeEvents(announcements, records));
					setLoading(false);
				};
				return;
			};

			if (mounted) setLoading(true);

			let nextAnnouncements = announcements;
			let nextRecords = records;
			try {
				if (needsAnnouncements) {
					const res = await authFetch(`${API_Route}/announcements`, { signal: controller.signal });
					if (res?.status === 0) return;
					if (res?.ok) {
						const data = await res.json();
						nextAnnouncements = data?.announcements || data || [];
						pushToCacheRef.current?.('announcements', nextAnnouncements, false);
					};
				};

				if (needsRecords && userId) {
					const res = await authFetch(`${API_Route}/users/student/${userId}/records`, { signal: controller.signal });
					if (res?.status === 0) return;
					if (res?.ok) {
						const data = await res.json();
						nextRecords = data?.records || data || [];
						pushToCacheRef.current?.('records', nextRecords, false);
					};
				};
			} catch (err) {
				if (String(err).toLowerCase().includes('aborted')) return;
				console.error('Calendar load error:', err);
			} finally {
				if (mounted) {
					commitEvents(normalizeEvents(nextAnnouncements, nextRecords));
					setLoading(false);
				}
			};
		};

		load();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, [announcements, records, userId, refresh, commitEvents]);

	const buildMarkedDates = React.useMemo(() => {
		const map = {};
		for (const event of events) {
			if (!map[event.date]) map[event.date] = { dots: [] };
			const dot = { key: `${event.type}-${event.id}`, color: event.type === 'announcement' ? colors.announcement : colors.record };
			// Avoid duplicate keys
			if (!map[event.date].dots.some(d => d.key === dot.key)) map[event.date].dots.push(dot);
		};
		// mark selected
		if (!map[selectedDate]) map[selectedDate] = { dots: [], selected: true };
		map[selectedDate] = { ...(map[selectedDate] || {}), selected: true, selectedColor: theme.brand_primary };
		return map;
	}, [events, selectedDate]);

	const eventsForSelectedDate = React.useMemo(() => events.filter(e => e.date === selectedDate), [events, selectedDate]);

	if (loading) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size='large' />
		</View>
	);

	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={false}
					onRefresh={async () => {
						setRefresh({
							key: 'calendar',
							callback: async () => {
								// No-op, just trigger useEffect reload
							}
						});
					}}
				/>
			}
		>
			<View style={{ flex: 1, backgroundColor: theme.fill_base }}>
				<View style={{ padding: 8 }}>
					<RNCalendar
						onDayPress={(day) => setSelectedDate(day.dateString)}
						markedDates={buildMarkedDates}
						theme={{
							todayTextColor: theme.brand_primary,
							arrowColor: `${theme.brand_primary}80`
						}}
						markingType={'multi-dot'}
					/>
				</View>

				<View style={{ flex: 1, padding: 12 }}>
					<Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Events for {selectedDate}</Text>
					{eventsForSelectedDate.length === 0 ? (
						<Text style={{ color: theme.color_text_secondary }}>No events for this day.</Text>
					) : (
						<FlatList
							data={eventsForSelectedDate}
							keyExtractor={(item) => `${item.type}-${item.id}`}
							renderItem={({ item }) => (
								<TouchableOpacity
									onPress={() => {
										if (item.type === 'announcement') {
											// Provide the full announcement object and a setter so the detail
											// screen can optimistically update this calendar list and cache
											const setAnnouncement = (update) => {
												// Compute the new announcement object
												const newAnnouncement = typeof update === 'function' ? update(item.raw) : update;
												// Update local events list
												setEvents((prev) => prev.map(ev => {
													if (ev.type === 'announcement' && ev.id === item.id)
														return { ...ev, raw: newAnnouncement, title: newAnnouncement.title || ev.title };
													return ev;
												}));
												// Update cache if available
												try {
													updateCacheItem && updateCacheItem('announcements', 'id', item.id, newAnnouncement);
												} catch (e) {
													// ignore cache update failures
												};
											};
											navigationRef.current?.navigate('ViewAnnouncement', { announcement: item.raw, setAnnouncement });
										} else {
											navigationRef.current?.navigate('ViewRecord', { id: item.id });
										};
									}}
									style={{ padding: 12, backgroundColor: theme.fill_body, marginBottom: 8, borderRadius: 8 }}
								>
									<Flex direction='row' align='center' gap={8}>
										{item.cover && (
											<Image source={item.cover} style={{ width: 64, height: 64, borderRadius: 8 }} />
										)}
										<Flex direction='column' justify='center' align='start'>
											<Text style={{ fontWeight: '600' }}>{item.title}</Text>
											<Text style={{ color: theme.color_text_secondary }}>{item.type === 'announcement' ? 'Announcement' : 'Record'}</Text>
										</Flex>
									</Flex>
								</TouchableOpacity>
							)}
						/>
					)}
				</View>
			</View>
		</ScrollView>
	);
};

export default Calendar;
