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

const createNumberStorage = (name: string, defaultValue?: number) => {
	if (defaultValue && !mmkv.contains(name)) {
		mmkv.set(name, defaultValue)
	}
	return {
		key: name,
		get: () => mmkv.getNumber(name) || defaultValue,
		set: (value: number) => mmkv.set(name, value),
	}
}

const lastBackupTime = createNumberStorage('lastBackupTime')
const lastBackupSize = createNumberStorage('lastBackupSize')
const minimumInterval = createNumberStorage('minimumInterval', 1440) // 24 hours

Object.assign(mmkv, {
	getArray,
	lastBackupTime,
	lastBackupSize,
	minimumInterval,
})

export const storage = mmkv as typeof mmkv & {
	getArray: typeof getArray
	lastBackupTime: typeof lastBackupTime
	lastBackupSize: typeof lastBackupSize
	minimumInterval: typeof minimumInterval
}
