import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import { Fragment, useMemo } from 'react'
import { ScrollView } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { RecordsSummaryContent } from '@/components/RecordsSummaryContent'
import { useRecordsSummary } from '@/hooks/useRecordsSummary'

export default function Screen() {
	const { patientId, q } = useLocalSearchParams<{
		patientId?: string
		q?: string
	}>()

	const query = useMemo<TRecordsQuery>(
		() => ({
			patientId: patientId ? Number(patientId) : undefined,
			q: q || undefined,
		}),
		[patientId, q],
	)

	const { summary } = useRecordsSummary(query)

	return (
		<Fragment>
			<Stack.Screen options={{ title: 'Summary' }} />
			<ScrollView contentContainerClassName="px-4 py-4 gap-4">
				<RecordsSummaryContent
					summary={summary}
					query={query}
					layout="vertical"
				/>
			</ScrollView>
		</Fragment>
	)
}
