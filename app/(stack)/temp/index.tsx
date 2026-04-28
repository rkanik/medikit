import { Button } from '@/components/ui/button'
import { useNotification } from '@/services/notification'
import { log } from '@/utils/logs'
import { sleep } from '@/utils/sleep'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

export default function Screen() {
	const [running, setRunning] = useState(false)

	const { schedule, update } = useNotification({
		identifier: 'test',
		trigger: {
			channelId: 'default',
		},
		content: {
			title: 'Progress',
			body: 'Starting...',
		},
	})

	const showNotification = async () => {
		if (running) return
		setRunning(true)
		const v = await schedule()
		log('schedule', v)
		for (let i = 1; i < 100; i++) {
			await update({
				body: `Progress: ${Math.round((i / 100) * 100)}%`,
			})
			await sleep(100)
		}
		await update({ body: 'Done' })
		// await dismiss()
		setRunning(false)
	}
	return (
		<ScrollView
			contentContainerClassName="px-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Temp' }} />
			<View className="flex-1 items-center justify-center">
				<Button
					onPress={showNotification}
					icon="bell"
					text="Show Notification"
				/>
			</View>
		</ScrollView>
	)
}
