import { ScrollView, View } from 'react-native'

import { Stack } from 'expo-router'

import { BaseButton } from '@/components/base/button'
import { BaseCard } from '@/components/base/card'
import { FlashList } from '@/components/FlashList'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useDownloader } from '@/hooks/useDownloader'
import { useUpdater } from '@/hooks/useUpdater'
import { $df } from '@/utils/dayjs'
import { open } from '@/utils/open'

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
				<BaseButton
					title="Check for Updates"
					prependIcon="refresh-ccw"
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
							<Badge text={item.status} className="ml-1" />
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
								<BaseButton
									size="sm"
									prependIcon="external-link"
									title="Open"
									onPress={() => open(item.destination)}
								/>
							)}
							{item.status === 'paused' && (
								<BaseButton
									size="sm"
									prependIcon="play"
									title="Resume"
									onPress={() => {
										resume(item.source, item.destination)
									}}
								/>
							)}
							{item.status === 'downloading' && (
								<BaseButton
									size="sm"
									prependIcon="pause"
									title="Pause"
									onPress={() => {
										pause(item.source, item.destination)
									}}
								/>
							)}
							<BaseButton
								size="sm"
								prependIcon="trash"
								title="Delete"
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
