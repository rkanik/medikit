import type { TDialogContext } from './types'

import { createContext, useContext } from 'react'

export const DialogContext = createContext<TDialogContext>(null!)

export const useDialog = () => {
	const context = useContext(DialogContext)
	if (!context) {
		throw new Error('useDialog must use inside DialogProvider')
	}
	return context
}
