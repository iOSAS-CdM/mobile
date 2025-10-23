import React from 'react';

const RefreshContext = React.createContext(null);

/**
 * @type {React.FC<React.PropsWithChildren>}
 */
export const RefreshProvider = ({ children }) => {
	const [refresh, setRefresh] = React.useState(null);

	const value = React.useMemo(() => ({ refresh, setRefresh }), [refresh]);

	return (
		<RefreshContext.Provider value={value}>
			{children}
		</RefreshContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRefresh = () => React.useContext(RefreshContext);
