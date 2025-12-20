import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'

import { createContext, useContext, useState } from 'react'

export type TAppContext = {
	isSearching: boolean
	setSearching: Dispatch<SetStateAction<boolean>>
}

export const AppContext = createContext<TAppContext>(null!)

export const AppProvider = ({ children }: PropsWithChildren) => {
	const [isSearching, setSearching] = useState(false)
	return (
		<AppContext.Provider value={{ isSearching, setSearching }}>
			{children}
		</AppContext.Provider>
	)
}

export const useApp = () => {
	const context = useContext(AppContext)
	if (!context) throw new Error('useApp must be used within an AppProvider')
	return context
}
