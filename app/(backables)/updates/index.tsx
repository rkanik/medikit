import { BaseCard } from '@/components/base/card'
import { FlashList } from '@/components/FlashList'
import { Badge, BadgeText } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useDownloader } from '@/hooks/useDownloader'
import { useUpdater } from '@/hooks/useUpdater'
import { $df } from '@/utils/dayjs'
import { open } from '@/utils/open'
import { Stack } from 'expo-router'
import { ScrollView, View } from 'react-native'

export default function Screen() {
	const { checkForUpdates, loading, lastChecked } = useUpdater()
	const { data: downloads, pause, resume, remove } = useDownloader()

	return (
		<ScrollView
			contentContainerClassName="px-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Updates' }} />

			<Text>Updates: {$df(lastChecked, 'DD MMM, YYYY hh:mm A')}</Text>
			<View className="flex-row">
				<Button
					text="Check for Updates"
					icon="refresh-ccw"
					loading={loading}
					className="mt-4"
					onPress={() => checkForUpdates()}
				/>
			</View>

			<FlashList
				className="mt-4"
				scrollEnabled={false}
				data={downloads}
				renderItem={({ item }) => (
					<BaseCard className="mb-2">
						<View className="flex-row">
							<Text className="font-bold">
								{item.destination.split('/').pop()}
							</Text>
							<Badge
								size="sm"
								className="ml-1"
								action={
									(
										{
											completed: 'success',
											downloading: 'info',
											paused: 'info',
											'auto-paused': 'info',
											failed: 'error',
										} as const
									)[item.status]
								}
							>
								<BadgeText>{item.status}</BadgeText>
							</Badge>
						</View>
						<View className="flex-row items-center gap-2">
							<Progress
								value={
									((item.progress?.totalBytesWritten ?? 0) /
										(item.progress?.totalBytesExpectedToWrite ?? 0)) *
									100
								}
							/>
							<Text>
								{Math.round(
									((item.progress?.totalBytesWritten || 1) /
										(item.progress?.totalBytesExpectedToWrite || 1)) *
										100,
								)}
								%
							</Text>
						</View>
						<Text className="opacity-50">
							{item.progress
								? `${Math.round(
										item.progress.totalBytesExpectedToWrite / 1024 / 1024,
									)} MB`
								: ''}
							{' - '}
							{new URL(item.source).hostname}
						</Text>
						<View className="flex-row gap-2 mt-2">
							{item.status === 'completed' && (
								<Button
									size="sm"
									icon="external-link"
									text="Open"
									onPress={() => open(item.destination)}
								/>
							)}
							{item.status === 'paused' && (
								<Button
									size="sm"
									icon="play"
									text="Resume"
									onPress={() => {
										resume(item.source, item.destination)
									}}
								/>
							)}
							{item.status === 'downloading' && (
								<Button
									size="sm"
									icon="pause"
									text="Pause"
									onPress={() => {
										pause(item.source, item.destination)
									}}
								/>
							)}
							<Button
								size="sm"
								icon="trash"
								text="Delete"
								onPress={() => remove(item)}
							/>
						</View>
						{item.error && (
							<Text className="mt-2 text-error-500">{item.error}</Text>
						)}
					</BaseCard>
				)}
			/>
		</ScrollView>
	)
}
