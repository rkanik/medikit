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
const minimumInterval: number | undefined = undefined //15 // 15 minutes

export const initializeBackgroundTask = async (
	innerAppMountedPromise: Promise<void>,
) => {
	defineTask(taskName, async event => {
		console.log(`[${taskName}]: 🔃 Background task started`)
		await innerAppMountedPromise

		console.log(`[${taskName}]: ✅ backup started`)
		await backup()
		console.log(`[${taskName}]: ✅ backup completed`)

		console.log(`[${taskName}]: ✅ background task done`)
		return BackgroundTaskResult.Success
	})

	// Register the task
	if (!(await isTaskRegisteredAsync(taskName))) {
		console.log(`[${taskName}]: 🔃 Registering task...`)
		try {
			await registerTaskAsync(taskName, { minimumInterval })
			console.log(`[${taskName}]: ✅ Task registered!`)
		} catch (error) {
			console.log(`[${taskName}]: ❌ Task registration failed`, error)
		}
	}
}

export const useBackgroundTask = () => {
	const [status, setStatus] = useState<BackgroundTaskStatus | null>(null)
	const [isRegistered, setIsRegistered] = useState<boolean>(false)

	const update = useCallback(async () => {
		const status = await getStatusAsync()
		const isRegistered = await isTaskRegisteredAsync(taskName)
		console.log(`[${taskName}]: 🔃 Updating task status...`)
		console.log(`[${taskName}]: Status: ${status}`)
		console.log(`[${taskName}]: Is Registered: ${isRegistered}`)
		setStatus(status)
		setIsRegistered(isRegistered)
	}, [])

	const register = useCallback(async () => {
		console.log(`[${taskName}]: 🔃 Registering task...`)
		if (await isTaskRegisteredAsync(taskName)) {
			console.log(`[${taskName}]: ❌ Task already registered!`)
			return
		}
		await registerTaskAsync(taskName, {
			minimumInterval,
		})
		console.log(`[${taskName}]: ✅ Task registered!`)
	}, [])

	const unregister = useCallback(async () => {
		console.log(`[${taskName}]: 🔃 Unregistering task...`)
		if (!(await isTaskRegisteredAsync(taskName))) {
			console.log(`[${taskName}]: ❌ Task not registered!`)
			return
		}
		await unregisterTaskAsync(taskName)
		console.log(`[${taskName}]: ✅ Task unregistered!`)
	}, [])

	const toggle = useCallback(async () => {
		if (!isRegistered) await register()
		else await unregister()
		await update()
	}, [isRegistered, register, unregister, update])

	const trigger = useCallback(async () => {
		console.log(`[${taskName}]: 🔃 Triggering task...`)
		const result = await triggerTaskWorkerForTestingAsync()
		console.log(`[${taskName}]: ✅ Task triggered!`, result)
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
