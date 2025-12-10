import { useMMKVArray } from '@/hooks/useMMKVArray'
import { storage } from './storage'

type TLog = {
	time: number
	data: any[]
}

export const log = (...data: any[]) => {
	let logs = storage.getArray<TLog>('logs')
	logs.unshift({ time: Date.now(), data })
	if (logs.length > 50) {
		logs = logs.slice(0, 50)
	}
	storage.set('logs', JSON.stringify(logs))
}

export const useLogs = () => {
	return useMMKVArray<TLog>('logs')
}
