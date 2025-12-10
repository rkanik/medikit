import { log } from '@/utils/logs'
import {
	BackgroundTaskOptions,
	BackgroundTaskResult,
	BackgroundTaskStatus,
	getStatusAsync,
	registerTaskAsync,
	triggerTaskWorkerForTestingAsync,
	unregisterTaskAsync,
} from 'expo-background-task'
import {
	defineTask,
	isTaskRegisteredAsync,
	TaskManagerTaskBody,
} from 'expo-task-manager'
import { useCallback, useEffect, useState } from 'react'

export const createTask = <T = unknown>(
	taskName: string,
	execute: (event: TaskManagerTaskBody<T>) => Promise<void>,
	options?: BackgroundTaskOptions,
) => {
	const initializeTask = async (innerAppMountedPromise: Promise<void>) => {
		defineTask<T>(taskName, async event => {
			try {
				log(`[${taskName}]: 🔃 Background task started`)
				await innerAppMountedPromise

				log(`[${taskName}]: ✅ backup started`)
				await execute?.(event)
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
				await registerTaskAsync(taskName, options)
				log(`[${taskName}]: ✅ Task registered!`)
			} catch (error) {
				log(`[${taskName}]: ❌ Task registration failed`, error)
			}
		}
	}

	const useTask = () => {
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
			await registerTaskAsync(taskName, options)
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

	return {
		useTask,
		initializeTask,
	}
}
