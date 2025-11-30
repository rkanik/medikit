import {
	dismissNotificationAsync,
	getPermissionsAsync,
	NotificationContentInput,
	NotificationRequestInput,
	requestPermissionsAsync,
	scheduleNotificationAsync,
} from 'expo-notifications'
import { useMemo } from 'react'

export const createNotification = (input: NotificationRequestInput) => {
	const schedule = async () => {
		if (!(await getPermissionsAsync()).granted) {
			await requestPermissionsAsync()
		}
		return scheduleNotificationAsync(input)
	}
	const update = (content: NotificationContentInput) => {
		return scheduleNotificationAsync({
			...input,
			content: {
				...input.content,
				...content,
			},
		})
	}
	const dismiss = async () => {
		const id = input.trigger?.channelId || input.identifier
		if (id) await dismissNotificationAsync(id)
	}
	return {
		schedule,
		update,
		dismiss,
	}
}

export const useNotification = (input: NotificationRequestInput) => {
	return useMemo(() => createNotification(input), [input])
}
