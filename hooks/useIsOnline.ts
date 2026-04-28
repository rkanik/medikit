import { useMemo } from 'react'
import NetInfo from '@react-native-community/netinfo'

export const useIsOnline = () => {
	const info = NetInfo.useNetInfo()
	return useMemo(() => ({ isOnline: info.isConnected }), [info.isConnected])
}
