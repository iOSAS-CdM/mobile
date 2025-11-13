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

	React.useEffect(() => {
		let mounted = true;
		const controller = new AbortController();

		const load = async () => {
			setLoading(true);
			try {
				// Try to reuse cache when available
				let announcements = cache.announcements || [];
				let records = cache.records || [];

				if ((!announcements || announcements.length === 0)) {
					const res = await authFetch(`${API_Route}/announcements`, { signal: controller.signal });
					if (res?.status === 0) return;
					if (res?.ok) {
						const data = await res.json();
						announcements = data?.announcements || data || [];
						pushToCache('announcements', announcements, false);
					}
				}

				if ((!records || records.length === 0)) {
					const res = await authFetch(`${API_Route}/records`, { signal: controller.signal });
					if (res?.status === 0) return;
					if (res?.ok) {
						const data = await res.json();
						// API might return { records: [...] } or an array directly
						records = data?.records || data || [];
						pushToCache('records', records, false);
					}
				};

				// Normalize events to { id, type, title, date, raw, cover? }
				const normalized = [];
				for (const a of announcements) {
					const d = a.event_date || a.date || a.created_at || a.createdAt || a.created;
					if (!d) continue;
					// If the server already provides a date-only string (YYYY-MM-DD), use it directly.
					let iso;
					if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
						iso = d;
					} else {
						const dt = new Date(d);
						const pad = (n) => String(n).padStart(2, '0');
						iso = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
					};
					normalized.push({ id: a.id, type: 'announcement', title: a.title || a.description || 'Announcement', date: iso, raw: a, cover: a.cover ? { uri: a.cover } : null });
				};
				for (const r of records) {
					const d = r.date || r.created_at || r.createdAt || r.created;
					if (!d) continue;
					let iso;
					if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
						iso = d;
					} else {
						const dt = new Date(d);
						const pad = (n) => String(n).padStart(2, '0');
						iso = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
					};
					normalized.push({ id: r.id, type: 'record', title: r.title || r.violation || 'Record', date: iso, raw: r });
				};

				if (mounted)
					setEvents(normalized);
			} catch (err) {
				if (String(err).toLowerCase().includes('aborted')) return;
				console.error('Calendar load error:', err);
			} finally {
				if (mounted) setLoading(false);
			};
		};

		load();
		return () => {
			mounted = false;
			controller.abort();
		};
	}, [cache]);

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
