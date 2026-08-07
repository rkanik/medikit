import type { TMetricHistoryItem } from '@/components/PatientMetricHistoryModal'
import type { TTimelineMetricKey } from '@/const/timelineMetrics'
import { useMemo, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { PatientMetricCard } from '@/components/PatientMetricCard'
import { PatientMetricHistoryModal } from '@/components/PatientMetricHistoryModal'
import {
	TIMELINE_METRICS,
	toTimelineMetricNumber,
} from '@/const/timelineMetrics'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientTimelineQuery } from '@/queries/usePatientTimelineQuery'
import {
	formatPercentChange,
	percentChange,
} from '@/utils/growthIdeals'

export default function PatientGrowthScreen() {
	const { id, patientId } = usePatientIdParam()
	const [selectedKey, setSelectedKey] = useState<TTimelineMetricKey | null>(
		null,
	)
	const { data, isFetching, refetch } = usePatientTimelineQuery({
		patientId,
		page: 1,
		perPage: 500,
	})

	const timelineData = useMemo(() => {
		return (data?.pages ?? []).flatMap(page => page.data ?? [])
	}, [data?.pages])

	const metricSummaries = useMemo(() => {
		return TIMELINE_METRICS.map(metric => {
			const history: TMetricHistoryItem[] = []
			for (const entry of timelineData) {
				const value = entry.values?.find(item => item.key === metric.key)
				if (!value?.value?.trim()) continue
				history.push({
					entry,
					value: value.value,
					unit: value.unit,
				})
			}
			const latest = history[0] ?? null
			const previous = history[1] ?? null
			const currentNum = toTimelineMetricNumber(metric.key, latest?.value)
			const previousNum = toTimelineMetricNumber(metric.key, previous?.value)
			const changeLabel = formatPercentChange(
				currentNum != null && previousNum != null
					? percentChange(currentNum, previousNum)
					: null,
			)
			return { metric, history, latest, changeLabel }
		})
	}, [timelineData])

	const selected = useMemo(() => {
		if (!selectedKey) return null
		return (
			metricSummaries.find(item => item.metric.key === selectedKey) ?? null
		)
	}, [metricSummaries, selectedKey])

	const openMetricForm = (metricKey: TTimelineMetricKey, entryId?: number) => {
		const base =
			entryId != null
				? `/patients/${id}/growth/${entryId}/form`
				: `/patients/${id}/growth/new/form`
		router.push(`${base}?metric=${metricKey}` as any)
	}

	return (
		<View className="flex-1 relative">
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 16,
					paddingTop: 16,
					paddingBottom: 32,
				}}
				refreshControl={
					<RefreshControl refreshing={isFetching} onRefresh={refetch} />
				}
			>
				<View className="flex-row flex-wrap gap-3">
					{metricSummaries.map(({ metric, latest, changeLabel }) => (
						<View key={metric.key} className="w-[47%] grow">
							<PatientMetricCard
								metric={metric}
								value={latest?.value}
								unit={latest?.unit}
								date={latest?.entry.date}
								changeLabel={changeLabel}
								onPress={() => {
									if (!latest) {
										openMetricForm(metric.key)
										return
									}
									setSelectedKey(metric.key)
								}}
							/>
						</View>
					))}
				</View>
			</ScrollView>

			<PatientMetricHistoryModal
				metric={selected?.metric ?? null}
				history={selected?.history ?? []}
				visible={selectedKey != null}
				setVisible={visible => {
					if (!visible) setSelectedKey(null)
				}}
				onAdd={() => {
					const metricKey = selectedKey
					setSelectedKey(null)
					if (metricKey) openMetricForm(metricKey)
				}}
				onSelectEntry={entryId => {
					const metricKey = selectedKey
					setSelectedKey(null)
					if (metricKey) openMetricForm(metricKey, entryId)
				}}
			/>
		</View>
	)
}
