import { createMMKV } from 'react-native-mmkv'

const mmkv = createMMKV()

const getArray = <T = any>(name: string): T[] => {
	try {
		const string = mmkv.getString(name)
		const parsed = JSON.parse(string || '[]')
		if (Array.isArray(parsed)) return parsed
		return []
	} catch {
		return []
	}
}

Object.assign(mmkv, {
	getArray,
})

export const storage = mmkv as typeof mmkv & {
	getArray: typeof getArray
}
