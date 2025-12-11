import { BaseCard } from '@/components/base/card'
import { Badge, BadgeText } from '@/components/ui/badge'
import {
	Button,
	ButtonIcon,
	ButtonSpinner,
	ButtonText,
} from '@/components/ui/button'
import { Progress, ProgressFilledTrack } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useDownloader } from '@/hooks/useDownloader'
import { useUpdater } from '@/hooks/useUpdater'
import { $df } from '@/utils/dayjs'
import { FlashList } from '@shopify/flash-list'
import { Paths } from 'expo-file-system'
import { Stack } from 'expo-router'
import { RefreshCcwIcon } from 'lucide-react-native'
import { ScrollView, View } from 'react-native'

export default function Screen() {
	const { checkForUpdates, loading, lastChecked } = useUpdater()

	const { data: downloads, download, pause, resume, remove } = useDownloader()

	const source = 'http://ipv4.download.thinkbroadband.com/100MB.zip'
	const destination = Paths.join(Paths.document, '100MB.bin')

	return (
		<ScrollView
			contentContainerClassName="px-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Updates' }} />
			<Text>Updates: {$df(lastChecked, 'DD MMM, YYYY hh:mm A')}</Text>

			<Button className="mt-4" onPress={() => checkForUpdates()}>
				{loading && <ButtonSpinner color="gray" />}
				<ButtonIcon as={RefreshCcwIcon} size="lg" />
				<ButtonText>Check for Updates</ButtonText>
			</Button>
			<Button
				className="mt-4"
				onPress={() => {
					download(source, destination)
				}}
			>
				<ButtonText>Download 100MB</ButtonText>
			</Button>

			<Button
				className="mt-4"
				onPress={() => {
					pause(source, destination)
				}}
			>
				<ButtonText>Pause</ButtonText>
			</Button>

			<Button
				className="mt-4"
				onPress={() => {
					resume(source, destination)
				}}
			>
				<ButtonText>Resume</ButtonText>
			</Button>

			<FlashList
				className="mt-4"
				scrollEnabled={false}
				data={downloads}
				renderItem={({ item }) => (
					<BaseCard className="mb-2">
						<View className="flex-row">
							<Text bold>{item.destination.split('/').pop()}</Text>
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
								size="xs"
								className="flex-1"
								value={
									((item.progress?.totalBytesWritten ?? 0) /
										(item.progress?.totalBytesExpectedToWrite ?? 0)) *
									100
								}
							>
								<ProgressFilledTrack className="bg-green-500" />
							</Progress>
							<Text size="xs">
								{Math.round(
									((item.progress?.totalBytesWritten || 1) /
										(item.progress?.totalBytesExpectedToWrite || 1)) *
										100,
								)}
								%
							</Text>
						</View>
						<Text size="sm" className="opacity-50">
							{item.progress
								? `${Math.round(
										item.progress.totalBytesExpectedToWrite / 1024 / 1024,
								  )} MB`
								: ''}
							{' - '}
							{new URL(item.source).hostname}
						</Text>
						<View className="flex-row gap-2 mt-2">
							{item.status === 'paused' && (
								<Button
									size="xs"
									onPress={() => {
										resume(item.source, item.destination)
									}}
								>
									<ButtonText>Resume</ButtonText>
								</Button>
							)}
							{item.status === 'downloading' && (
								<Button
									size="xs"
									onPress={() => {
										pause(item.source, item.destination)
									}}
								>
									<ButtonText>Pause</ButtonText>
								</Button>
							)}
							<Button size="xs" onPress={() => remove(item)}>
								<ButtonText>Delete</ButtonText>
							</Button>
						</View>
						{item.error && (
							<Text size="xs" className="mt-2 text-error-500">
								{item.error}
							</Text>
						)}
					</BaseCard>
				)}
			/>

			{/* <BaseJson data={downloads2} className="mt-4" /> */}
		</ScrollView>
	)
}
