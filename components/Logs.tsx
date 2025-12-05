import { $df } from '@/utils/dayjs'
import { useLogs } from '@/utils/logs'
import { FlashList } from '@shopify/flash-list'
import { BaseDialog } from './base/BaseDialog'
import { BaseCard } from './base/card'
import { Fab } from './ui/fab'
import { Icon, InfoIcon } from './ui/icon'
import { Text } from './ui/text'

export const Logs = () => {
	const { data } = useLogs()
	return (
		<BaseDialog
			scrollable={true}
			trigger={v => (
				<Fab {...v} size="lg">
					<Icon as={InfoIcon} size="md" color="white" />
				</Fab>
			)}
		>
			<FlashList
				data={data}
				style={{ flex: 1 }}
				scrollEnabled={true}
				contentContainerClassName="px-4 pt-4 pb-16"
				contentContainerStyle={{ flexGrow: 1 }}
				renderItem={({ item }) => (
					<BaseCard className="mb-2 p-2">
						<Text size="xs" className="opacity-50 mb-1 uppercase">
							{$df(item.time, 'DD MMM, YYYY hh:mm A')}
						</Text>
						<Text>
							{item.data
								.map(v => {
									return typeof v !== 'string' ? JSON.stringify(v, null, 1) : v
								})
								.join(', ')}
						</Text>
					</BaseCard>
				)}
			/>
		</BaseDialog>
	)
}
