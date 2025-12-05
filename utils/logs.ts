import { useMMKVArray } from '@/hooks/useMMKVArray'
import { storage } from './storage'

type TLog = {
	time: number
	data: any[]
}

export const log = (...data: any[]) => {
	const logs = storage.getArray<TLog>('logs')
	logs.unshift({ time: Date.now(), data })
	if (logs.length > 250) logs.pop()
	storage.set('logs', JSON.stringify(logs))
}

export const useLogs = () => {
	return useMMKVArray<TLog>('logs')
}
