import { useRecordsSummary } from '@/hooks/useRecordsSummary'
import { View } from 'react-native'
import { BaseCard } from './base/card'
import { Text, Title } from './ui/text'

export type TRecordsSummaryProps = {
	patientId?: number
}

export const RecordsSummary = ({ patientId }: TRecordsSummaryProps) => {
	const { summary } = useRecordsSummary({ patientId })
	return (
		<BaseCard>
			<Title>Costs</Title>
			<View className="gap-4 mt-4">
				<View className="flex-row gap-8 flex-wrap">
					<View>
						<Text>Total</Text>
						<Text className="font-bold">{summary.total} TK</Text>
					</View>
					<View>
						<Text>This Month</Text>
						<Text className="font-bold">{summary.thisMonth} TK</Text>
					</View>
					<View>
						<Text>This Year</Text>
						<Text className="font-bold">{summary.thisYear} TK</Text>
					</View>
				</View>
				<View className="flex-row gap-8 flex-wrap">
					{Object.entries(summary.types).map(([type, amount]) => (
						<View key={type}>
							<Text>{type}</Text>
							<Text className="font-bold">{amount} TK</Text>
						</View>
					))}
				</View>
			</View>
		</BaseCard>
	)
}
