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

const keys = {
	lastBackupTime: 'lastBackupTime',
	lastBackupSize: 'lastBackupSize',
}

Object.assign(mmkv, {
	keys,
	getArray,
})

export const storage = mmkv as typeof mmkv & {
	keys: typeof keys
	getArray: typeof getArray
}
