import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

export type TPendingRecordAttachment = {
	uri: string
	name?: string
	mime?: string
	size?: number
}

export type TAppContext = {
	isSearching: boolean
	setSearching: Dispatch<SetStateAction<boolean>>
	pendingRecordAttachments: TPendingRecordAttachment[] | null
	setPendingRecordAttachments: Dispatch<
		SetStateAction<TPendingRecordAttachment[] | null>
	>
}

export const AppContext = createContext<TAppContext>(null!)

export const AppProvider = ({ children }: PropsWithChildren) => {
	const [isSearching, setSearching] = useState(false)
	const [pendingRecordAttachments, setPendingRecordAttachments] = useState<
		TPendingRecordAttachment[] | null
	>(null)
	return (
		<AppContext.Provider
			value={{
				isSearching,
				setSearching,
				pendingRecordAttachments,
				setPendingRecordAttachments,
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export const useApp = () => {
	const context = useContext(AppContext)
	if (!context) throw new Error('useApp must be used within an AppProvider')
	return context
}
