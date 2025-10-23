import React from 'react';
import { Keyboard } from 'react-native';

const KeyboardContext = React.createContext(false);

/**
 * @type {React.FC<React.PropsWithChildren>}
 */
export const KeyboardProvider = ({ children }) => {
	const [keyboardVisible, setKeyboardVisible] = React.useState(false);

	React.useEffect(() => {
		const showListener = Keyboard.addListener(
			'keyboardDidShow',
			(event) => {
				setKeyboardVisible(true);
			}
		);
		const hideListener = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardVisible(false);
		});

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, []);

	return (
		<KeyboardContext.Provider value={keyboardVisible}>
			{children}
		</KeyboardContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useKeyboard = () => React.useContext(KeyboardContext);
