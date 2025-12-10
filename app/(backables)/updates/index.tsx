import { BaseJson } from '@/components/base/Json'
import {
	Button,
	ButtonIcon,
	ButtonSpinner,
	ButtonText,
} from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useDownloader } from '@/hooks/useDownloader'
import { useMMKVArray } from '@/hooks/useMMKVArray'
import { useUpdater } from '@/hooks/useUpdater'
import { $df } from '@/utils/dayjs'
import { Paths } from 'expo-file-system'
import { RefreshCcwIcon } from 'lucide-react-native'
import { ScrollView } from 'react-native'

export default function Screen() {
	const { checkForUpdates, loading, lastChecked } = useUpdater()

	const { data: downloads, download, pause, resume } = useDownloader()

	const { data: downloads2 } = useMMKVArray('useDownloader:downloads')

	const source = 'http://ipv4.download.thinkbroadband.com/100MB.zip'
	const destination = Paths.join(Paths.document, '100MB.bin')

	return (
		<ScrollView
			contentContainerClassName="px-4"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Text>Updates: {$df(lastChecked, 'DD MMM, YYYY hh:mm A')}</Text>

			<Button onPress={checkForUpdates} className="mt-4">
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

			{/* <FlashList
				className="mt-4"
				scrollEnabled={false}
				data={downloads}
				renderItem={({ item }) => (
					<BaseCard className="p-2 mb-2">
						<Text>{item.source}</Text>
						<Text>{item.destination}</Text>
						<Text>{item.status}</Text>
					</BaseCard>
				)}
			/> */}

			<BaseJson data={downloads2} className="mt-4" />
		</ScrollView>
	)
}
