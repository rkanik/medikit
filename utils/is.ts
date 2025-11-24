import { Platform } from 'react-native'

export const isWeb = Platform.OS === 'web'
export const isIOS = Platform.OS === 'ios'
export const isNative = ['ios', 'android'].includes(Platform.OS)
export const isAndroid = Platform.OS === 'android'

export type TIsOS = typeof is
export const is = {
	isWeb,
	isIOS,
	isNative,
	isAndroid,
}

export default is
