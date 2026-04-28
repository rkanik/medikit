import { FlashList } from '@/components/FlashList'
import { $df } from '@/utils/dayjs'
import { useLogs } from '@/utils/logs'
import { BaseButton } from './base/button'
import { BaseCard } from './base/card'
import { BaseModal } from './base/modal'
import { Text } from './ui/text'

export const Logs = () => {
	const { data } = useLogs()
	return (
		<BaseModal
			trigger={v => (
				<BaseButton
					{...v}
					pill
					size="icon-lg"
					prependIcon="info"
					prependIconClassName="text-xl"
					wrapperClassName="absolute bottom-4 right-4 z-10"
				/>
			)}
		>
			<FlashList
				data={data}
				style={{ flex: 1 }}
				scrollEnabled={true}
				contentContainerClassName="px-4 pt-4 pb-16 flex-grow"
				renderItem={({ item }) => (
					<BaseCard className="mb-2 p-2">
						<Text className="opacity-50 mb-1 uppercase">
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
		</BaseModal>
	)
}
