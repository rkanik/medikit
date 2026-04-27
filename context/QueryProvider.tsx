import type { PropsWithChildren } from 'react'
import type { AppStateStatus } from 'react-native'

import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'

import NetInfo from '@react-native-community/netinfo'
import {
	focusManager,
	onlineManager,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'

const getHandler = (func: string, index = 0) => {
	return (event: any, ...args: any[]) => {
		const callback = args[index]?.meta?.[func]
		if (typeof callback === 'function') {
			callback(event)
		}
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// retry: false,
			// gcTime: Infinity,
			// staleTime: 10000,
		},
	},
	queryCache: new QueryCache({
		onError: getHandler('onError'),
		onSuccess: getHandler('onSuccess'),
	}),
})

const onAppStateChange = (status: AppStateStatus) => {
	if (Platform.OS !== 'web') {
		focusManager.setFocused(status === 'active')
	}
}

export const QueryProvider = ({ children }: PropsWithChildren) => {
	useEffect(() => {
		onlineManager.setEventListener(setOnline => {
			return NetInfo.addEventListener(state => {
				setOnline(!!state.isConnected)
			})
		})
		const subscription = AppState.addEventListener('change', onAppStateChange)
		return () => subscription.remove()
	}, [])

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
