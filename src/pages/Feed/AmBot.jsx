import React from 'react';
import { ScrollView, View } from 'react-native';
import { Flex, ActivityIndicator } from '@ant-design/react-native';
import Markdown from 'react-native-markdown-display';

import { useLinkTo } from '@react-navigation/native';

import { useCache } from '../../contexts/CacheContext';

import Text from '../../components/Text';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Input from '../../components/forms/Input';
import IconButton from '../../components/IconButton';

import { API_Route, navigationRef } from '../../main';
import authFetch from '../../utils/authFetch';

import theme from '../../styles/theme';

/**
 * @typedef {{
 * 	sender: 'user' | 'bot',
 * 	content: string
 * }} Message
 */

/**
 * AmBot Page Component for iOSAS
 */
const AmBot = () => {
	const linkTo = useLinkTo();

	/** @type {[Message[], React.Dispatch<React.SetStateAction<Message[]>>]} */
	const [messages, setMessages] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [sessionId, setSessionId] = React.useState(null);
	const [text, setText] = React.useState('');

	const { cache } = useCache();

	const [suggestedQuestions, setSuggestedQuestions] = React.useState([]);

	// Initialize with welcome message
	React.useEffect(() => {
		setMessages([{ sender: 'bot', content: 'Hello! How may I help you today?' }]);
	}, []);

	// Fetch suggested questions
	React.useEffect(() => {
		const fetchSuggestions = async () => {
			try {
				const response = await authFetch(`${API_Route}/ambot/suggestions`);
				if (response.ok) {
					const data = await response.json();
					if (data.suggestions && Array.isArray(data.suggestions))
						setSuggestedQuestions(data.suggestions);
				};
			} catch (error) {
				console.error('Error fetching suggestions:', error);
			};
		};

		fetchSuggestions();
	}, []);

	const scrollRef = React.useRef(null);

	const clearConversation = () => {
		setMessages([{ sender: 'bot', content: 'Hello! How may I help you today?' }]);
		setSessionId(null);
	};

	const handleSendMessage = React.useCallback(async (message) => {
		if (!text.trim() && !message) return;
		const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		if (!sessionId) setSessionId(session);

		const userMessage = text.trim() || message;
		setText('');

		// Add user message to chat
		const newMessage = { sender: 'user', content: userMessage };
		setMessages((prevMessages) => [...prevMessages, newMessage]);

		// Set loading state
		setIsLoading(true);

		// Add empty bot message that will be filled with streaming response
		const botMessageIndex = messages.length + 1;
		setMessages((prevMessages) => [...prevMessages, {
			sender: 'bot',
			content: ''
		}]);

		try {
			// React Native doesn't support ReadableStream, so we'll poll for chunks
			const response = await authFetch(`${API_Route}/ambot/${session}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: userMessage })
			});

			if (!response.ok)
				throw new Error('Network response was not ok');

			const reply = await response.text();

			// Update bot message with full reply
			setMessages((prev) => {
				const newMessages = [...prev];
				newMessages[botMessageIndex] = {
					sender: 'bot',
					content: reply
				};
				return newMessages;
			});
		} catch (error) {
			console.error('Error sending message:', error);
			// Update bot message with error
			setMessages(prev => {
				const newMessages = [...prev];
				newMessages[botMessageIndex] = {
					sender: 'bot',
					content: 'Sorry, there was an error processing your request. Please try again later.'
				};
				return newMessages;
			});
		} finally {
			setIsLoading(false);
		};
	}, [text, messages.length, sessionId]);

	return (
		<>
			<Flex direction='row' justify='space-between' align='center' style={{ width: '100%', padding: theme.v_spacing_md, borderBottomWidth: 0.25, borderBottomColor: theme.border_color_base, backgroundColor: theme.fill_base }}>
				<Button size='small' icon='left' onPress={() => navigationRef.current?.goBack()} />
				<Text style={{ fontSize: theme.font_size_subhead, fontWeight: '600' }}>AmBot</Text>
				<Button size='small' icon='clear' onPress={clearConversation} />
			</Flex>

			<ScrollView
				ref={scrollRef}
				style={{ flex: 1, padding: theme.v_spacing_md }}
				keyboardShouldPersistTaps='handled'
				onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
			>
				{messages.map((message, index) => (
					<Flex
						key={index}
						direction='row'
						justify={message.sender === 'user' ? 'end' : 'start'}
						style={{ marginBottom: theme.v_spacing_md }}
					>
						<View style={{ maxWidth: '80%' }}>
							<Flex direction='row' align='end' gap={8}>
								{message.sender === 'bot' && (
									<IconButton
										name='robot'
										type='primary'
										size={32}
									/>
								)}
								<View style={{ backgroundColor: message.sender === 'user' ? theme.brand_primary : theme.fill_base, paddingHorizontal: theme.h_spacing_md, paddingVertical: theme.v_spacing_sm, borderRadius: 8 }}>
									{message.content.length > 0 ? (
										<Markdown
											style={{
												body: {
													color: message.sender === 'user' ? '#fff' : '#000',
													fontSize: theme.font_size_base
												},
												link: {
													color: message.sender === 'user' ? '#fff' : theme.brand_primary,
													textDecorationLine: 'underline'
												},
												paragraph: { marginTop: 0, marginBottom: 0 }
											}}
											onLinkPress={(url) => {
												// Handle internal navigation
												if (url.startsWith('/')) {
													// Map API paths to mobile app navigation paths
													// '/Home'
													// '/Cases'
													// '/Calendar'
													// '/Organizations'
													// '/Profile'
													// Navigate to /Feed with parameter: tab = mapped path
													const tab = url.slice(1); // e.g., 'Home'
													navigationRef.current?.navigate('Feed', { initialTab: tab });
													return false;
												};
												// External links open in browser by default
												return true;
											}}
										>
											{message.content}
										</Markdown>
									) : (
										<Flex justify='start' align='center' style={{ gap: theme.h_spacing_sm }}>
											<ActivityIndicator size='small' />
											<Text style={{ color: theme.color_text_caption, fontSize: theme.font_size_base }}>Thinking...</Text>
										</Flex>
									)}
								</View>
								{message.sender === 'user' && (
									<Avatar
										size={32}
										uri={cache.user?.profilePicture + `?random=${Math.random()}`}
									/>
								)}
							</Flex>
						</View>
					</Flex>
				))}

				{/* Suggested Questions */}
				{messages.length === 1 && !isLoading && suggestedQuestions.length > 0 && (
					<Flex direction='column' style={{ gap: theme.v_spacing_sm, marginTop: theme.v_spacing_md }}>
						<Text style={{ fontSize: theme.font_size_caption, color: theme.color_text_caption }}>
							Suggested questions:
						</Text>
						{suggestedQuestions.map((question, index) => (
							<Button
								key={index}
								size='small'
								onPress={() => {
									handleSendMessage(question);
								}}
								disabled={isLoading}
								style={{ borderWidth: 0.5, borderColor: theme.border_color_base }}
							>
								{question}
							</Button>
						))}
					</Flex>
				)}
			</ScrollView>

			<View style={{ padding: theme.h_spacing_md, borderTopWidth: 0.5, borderTopColor: theme.border_color_base, backgroundColor: theme.fill_base }}>
				<Flex direction='row' align='center' gap={8}>
					<Input
						placeholder='Write a message...'
						multiline
						wrapperStyle={{ flex: 1 }}
						value={text}
						onChangeText={setText}
					/>
					<IconButton
						name='send'
						size={32}
						disabled={isLoading || !text.trim()}
						onPress={handleSendMessage}
					/>
				</Flex>
			</View>
		</>
	);
};

export default AmBot;
