import type { TRecordsQuery } from '@/api/records'
import type { ViewProps } from 'react-native'

import { ScrollView, View } from 'react-native'

import { useRecordsSummary } from '@/hooks/useRecordsSummary'

import { BaseCard } from './base/card'
import { Subtitle, Title } from './ui/text'

export type TRecordsSummaryProps = ViewProps & {
	query: TRecordsQuery
}

export const RecordsSummary = ({ query, ...props }: TRecordsSummaryProps) => {
	const { summary } = useRecordsSummary(query)
	return (
		<View {...props}>
			<Title>Summary</Title>
			<View className="gap-4 mt-2">
				<ScrollView
					horizontal
					contentContainerClassName="gap-4"
					showsHorizontalScrollIndicator={false}
				>
					<BaseCard>
						<Subtitle>Total</Subtitle>
						<Title>{summary.total} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>Average (Monthly)</Subtitle>
						<Title>{summary.monthlyAverage} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>Average (Yearly)</Subtitle>
						<Title>{summary.yearlyAverage} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>This Month</Subtitle>
						<Title>{summary.thisMonth} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>Last Month</Subtitle>
						<Title>{summary.lastMonth} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>Last 6 Months</Subtitle>
						<Title>{summary.last6Months} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>Last 12 Months</Subtitle>
						<Title>{summary.last12Months} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>This Year</Subtitle>
						<Title>{summary.thisYear} TK</Title>
					</BaseCard>
					<BaseCard>
						<Subtitle>Last Year</Subtitle>
						<Title>{summary.lastYear} TK</Title>
					</BaseCard>
				</ScrollView>
				<ScrollView
					horizontal
					contentContainerClassName="gap-4"
					showsHorizontalScrollIndicator={false}
				>
					{Object.entries(summary.tags).map(([tag, amount]) => (
						<BaseCard key={tag}>
							<Subtitle>{tag}</Subtitle>
							<Title>{amount} TK</Title>
						</BaseCard>
					))}
				</ScrollView>
			</View>
		</View>
	)
}
