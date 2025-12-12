import { log } from '@/utils/logs'
import { storage } from '@/utils/storage'
import {
	BackgroundTaskResult,
	BackgroundTaskStatus,
	getStatusAsync,
	registerTaskAsync,
	triggerTaskWorkerForTestingAsync,
	unregisterTaskAsync,
} from 'expo-background-task'
import { defineTask, isTaskRegisteredAsync } from 'expo-task-manager'
import { useCallback, useEffect, useState } from 'react'
import { useMMKVNumber } from 'react-native-mmkv'
import { backup } from './backup'

const taskName = 'MediKitBackupBackgroundTask'

export const minimumIntervals = [
	{ title: '15 Minutes', value: 15 },
	{ title: '30 Minutes', value: 30 },
	{ title: '1 Hour', value: 60 },
	{ title: '6 Hours', value: 360 },
	{ title: '12 Hours', value: 720 },
	{ title: '18 Hours', value: 1080 },
	{ title: '24 Hours', value: 1440 },
]

export const initializeBackgroundTask = async (
	innerAppMountedPromise: Promise<void>,
) => {
	defineTask(taskName, async () => {
		try {
			log(`[${taskName}]: 🔃 Background task started`)
			await innerAppMountedPromise

			log(`[${taskName}]: ✅ backup started`)
			await backup()
			log(`[${taskName}]: ✅ backup completed`)

			log(`[${taskName}]: ✅ background task done`)
			return BackgroundTaskResult.Success
		} catch (error) {
			log(`[${taskName}]: ❌ Background task failed`, error)
			return BackgroundTaskResult.Failed
		}
	})

	// Register the task
	if (!(await isTaskRegisteredAsync(taskName))) {
		log(`[${taskName}]: 🔃 Registering task...`)
		try {
			await registerTaskAsync(taskName, {
				minimumInterval: storage.minimumInterval.get(),
			})
			log(`[${taskName}]: ✅ Task registered!`)
		} catch (error) {
			log(`[${taskName}]: ❌ Task registration failed`, error)
		}
	}
}

export const useBackgroundTask = () => {
	const [status, setStatus] = useState<BackgroundTaskStatus | null>(null)
	const [isRegistered, setIsRegistered] = useState<boolean>(false)
	const [minimumInterval] = useMMKVNumber(storage.minimumInterval.key)

	const update = useCallback(async () => {
		const status = await getStatusAsync()
		const isRegistered = await isTaskRegisteredAsync(taskName)
		log(`[${taskName}]: 🔃 Updating task status...`)
		log(`[${taskName}]: Status: ${status}`)
		log(`[${taskName}]: Is Registered: ${isRegistered}`)
		setStatus(status)
		setIsRegistered(isRegistered)
	}, [])

	const register = useCallback(
		async (minimumInterval?: number) => {
			log(`[${taskName}]: 🔃 Registering task...`)
			if (await isTaskRegisteredAsync(taskName)) {
				log(`[${taskName}]: ❌ Task already registered!`)
				return
			}
			await registerTaskAsync(taskName, {
				minimumInterval: minimumInterval || storage.minimumInterval.get(),
			})
			await update()
			log(`[${taskName}]: ✅ Task registered!`)
		},
		[update],
	)

	const unregister = useCallback(async () => {
		log(`[${taskName}]: 🔃 Unregistering task...`)
		if (!(await isTaskRegisteredAsync(taskName))) {
			log(`[${taskName}]: ❌ Task not registered!`)
			return
		}
		await unregisterTaskAsync(taskName)
		await update()
		log(`[${taskName}]: ✅ Task unregistered!`)
	}, [update])

	const toggle = useCallback(async () => {
		if (!isRegistered) await register()
		else await unregister()
		await update()
	}, [isRegistered, register, unregister, update])

	const trigger = useCallback(async () => {
		log(`[${taskName}]: 🔃 Triggering task...`)
		const result = await triggerTaskWorkerForTestingAsync()
		log(`[${taskName}]: ✅ Task triggered!`, result)
	}, [])

	const setMinimumInterval = useCallback(async (value: number) => {
		storage.minimumInterval.set(value)
		await unregisterTaskAsync(taskName)
		await registerTaskAsync(taskName, {
			minimumInterval: value || storage.minimumInterval.get(),
		})
	}, [])

	useEffect(() => {
		update()
	}, [update])

	return {
		status,
		isRegistered,
		minimumInterval,
		toggle,
		trigger,
		register,
		unregister,
		setMinimumInterval,
	}
}
