import { log } from '@/utils/logs'
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
import { backup } from './backup'

const taskName = 'MediKitBackupBackgroundTask'
const minimumInterval: number | undefined = 120 // 2 hours / 120 minutes

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
			await registerTaskAsync(taskName, { minimumInterval })
			log(`[${taskName}]: ✅ Task registered!`)
		} catch (error) {
			log(`[${taskName}]: ❌ Task registration failed`, error)
		}
	}
}

export const useBackgroundTask = () => {
	const [status, setStatus] = useState<BackgroundTaskStatus | null>(null)
	const [isRegistered, setIsRegistered] = useState<boolean>(false)

	const update = useCallback(async () => {
		const status = await getStatusAsync()
		const isRegistered = await isTaskRegisteredAsync(taskName)
		log(`[${taskName}]: 🔃 Updating task status...`)
		log(`[${taskName}]: Status: ${status}`)
		log(`[${taskName}]: Is Registered: ${isRegistered}`)
		setStatus(status)
		setIsRegistered(isRegistered)
	}, [])

	const register = useCallback(async () => {
		log(`[${taskName}]: 🔃 Registering task...`)
		if (await isTaskRegisteredAsync(taskName)) {
			log(`[${taskName}]: ❌ Task already registered!`)
			return
		}
		await registerTaskAsync(taskName, {
			minimumInterval,
		})
		await update()
		log(`[${taskName}]: ✅ Task registered!`)
	}, [update])

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

	useEffect(() => {
		update()
	}, [update])

	return {
		status,
		isRegistered,
		toggle,
		trigger,
		register,
		unregister,
	}
}
