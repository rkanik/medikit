import type { TTimelineMetric } from '@/const/timelineMetrics'
import type { TPatientTimelineEntry } from '@/types/database'
import { View } from 'react-native'
import { formatTimelineMetricValue } from '@/const/timelineMetrics'
import { $df } from '@/utils/dayjs'
import { BaseButton } from './base/button'
import { BaseCard } from './base/card'
import { BaseModal } from './base/modal'
import { Text, Title } from './ui/text'

export type TMetricHistoryItem = {
	entry: TPatientTimelineEntry
	value: string
	unit?: string | null
}

type TPatientMetricHistoryModalProps = {
	metric: TTimelineMetric | null
	history: TMetricHistoryItem[]
	visible: boolean
	setVisible: (visible: boolean) => void
	onAdd: () => void
	onSelectEntry: (entryId: number) => void
}

export const PatientMetricHistoryModal = ({
	metric,
	history,
	visible,
	setVisible,
	onAdd,
	onSelectEntry,
}: TPatientMetricHistoryModalProps) => {
	return (
		<BaseModal visible={visible} setVisible={setVisible} height="75%">
			<View className="px-4 pb-8">
				<View className="mb-4 flex-row items-center justify-between gap-3">
					<View className="flex-1">
						<Title>{metric?.label ?? 'History'}</Title>
						<Text className="mt-1 text-sm opacity-60">
							{history.length
								? `${history.length} reading${history.length === 1 ? '' : 's'}`
								: 'No readings yet'}
						</Text>
					</View>
					<BaseButton
						pill
						size="sm"
						prependIcon="plus"
						title="Add"
						onPress={onAdd}
					/>
				</View>

				{history.length === 0 ? (
					<BaseCard className="items-center py-10">
						<Text className="opacity-60">
							No {metric?.label?.toLowerCase() ?? 'metric'} history yet
						</Text>
					</BaseCard>
				) : (
					<View>
						{history.map((item, index) => {
							const display = formatTimelineMetricValue(
								metric?.key ?? '',
								item.value,
								item.unit,
							)
							return (
								<BaseCard
									key={`${item.entry.id}-${metric?.key ?? 'metric'}`}
									className="mb-2 p-4"
									onPress={() => {
										if (item.entry.id == null) return
										onSelectEntry(item.entry.id)
									}}
								>
									<View className="flex-row items-baseline justify-between gap-3">
										<Text className="text-xl font-semibold flex-1">
											{display}
										</Text>
										<Text className="text-sm opacity-60">
											{$df(item.entry.date, 'DD MMM, YYYY')}
										</Text>
									</View>
									{item.entry.note ? (
										<Text className="mt-1 text-sm opacity-70" numberOfLines={2}>
											{item.entry.note}
										</Text>
									) : null}
									{index === 0 ? (
										<Text className="mt-2 text-xs font-medium text-primary">
											Latest
										</Text>
									) : null}
								</BaseCard>
							)
						})}
					</View>
				)}
			</View>
		</BaseModal>
	)
}
