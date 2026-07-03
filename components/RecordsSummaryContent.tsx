import type { TRecordsSummary } from '@/hooks/useRecordsSummary'
import type { TRecordsQuery } from '@/queries/useRecordsQuery'
import { ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { getSummaryStatItems } from '@/hooks/useRecordsSummary'
import { BaseCard } from './base/card'
import { Subtitle, Title } from './ui/text'

export type TRecordsSummaryContentProps = {
	summary: TRecordsSummary
	query: TRecordsQuery
	layout?: 'horizontal' | 'vertical'
}

export const RecordsSummaryContent = ({
	summary,
	query,
	layout = 'horizontal',
}: TRecordsSummaryContentProps) => {
	const statItems = getSummaryStatItems(summary)
	const tagEntries = Object.entries(summary.tags)

	const statCards = statItems.map(({ label, value }) => (
		<BaseCard key={label}>
			<Subtitle>{label}</Subtitle>
			<Title>{value} TK</Title>
		</BaseCard>
	))

	const tagCards = tagEntries.map(([tag, amount]) => (
		<BaseCard key={tag} onPress={() => router.push(`/tags/${tag}`)}>
			<Subtitle>{tag}</Subtitle>
			<Title>{amount} TK</Title>
		</BaseCard>
	))

	if (layout === 'vertical') {
		return (
			<View className="gap-4 flex-row flex-wrap">
				{statCards}
				{tagCards}
			</View>
		)
	}

	return (
		<View className="gap-4">
			<ScrollView
				horizontal
				contentContainerClassName="gap-4"
				showsHorizontalScrollIndicator={false}
			>
				{statCards}
			</ScrollView>
			{!!tagEntries.length && (
				<ScrollView
					horizontal
					contentContainerClassName="gap-4"
					showsHorizontalScrollIndicator={false}
				>
					{tagCards}
				</ScrollView>
			)}
		</View>
	)
}
