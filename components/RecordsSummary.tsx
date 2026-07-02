import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import type { ViewProps } from 'react-native'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useRecordsSummary } from '@/hooks/useRecordsSummary'
import { hrefRecordsSummary } from '@/utils/recordsRoutes'
import { RecordsSummaryContent } from './RecordsSummaryContent'
import { Pressable } from './ui/pressable'
import { Text, Title } from './ui/text'

export type TRecordsSummaryProps = ViewProps & {
	query: TRecordsQuery
}

export const RecordsSummary = ({ query, ...props }: TRecordsSummaryProps) => {
	const { summary } = useRecordsSummary(query)

	return (
		<View {...props}>
			<View className="flex-row items-center justify-between">
				<Title>Summary</Title>
				<Pressable onPress={() => router.push(hrefRecordsSummary(query))}>
					<Text className="text-primary">See all</Text>
				</Pressable>
			</View>
			<View className="mt-2">
				<RecordsSummaryContent summary={summary} query={query} />
			</View>
		</View>
	)
}
