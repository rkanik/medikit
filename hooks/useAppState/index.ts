import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export const useAppState = (
	onForeground?: () => void,
	onBackground?: () => void,
) => {
	const appState = useRef(AppState.currentState)
	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			(nextState: AppStateStatus) => {
				if (
					appState.current.match(/inactive|background/) &&
					['active'].includes(nextState)
				) {
					onForeground?.()
				}
				if (
					appState.current.match(/active/) &&
					['background', 'inactive'].includes(nextState)
				) {
					onBackground?.()
				}
				appState.current = nextState
			},
		)
		return () => {
			subscription.remove()
		}
	}, [onForeground, onBackground])
}
