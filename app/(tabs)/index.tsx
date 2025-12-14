import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseCard } from '@/components/base/card'
import { RecordCard } from '@/components/RecordCard'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { router } from 'expo-router'
import { View } from 'react-native'

import { FlashList } from '@/components/FlashList'
import { cn } from 'tailwind-variants'

export default function Screen() {
	const { data, summary } = api.records.useRecords()
	return (
		<View className="flex-1 relative">
			<FlashList
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerClassName={cn('flex-grow flex-col-reverse px-4', {
					'pb-4': data.length === 0,
					'pb-28': data.length > 0,
				})}
				ListFooterComponent={() => {
					if (data.length === 0)
						return (
							<BaseCard className="items-center py-12">
								<Icon name="list-todo" />
								<Text className="mt-2">No records found!</Text>
								<Text className="text-center">
									Add a new record to get started
								</Text>
								<Button
									icon="plus"
									text="Add Record"
									className="mt-4"
									onPress={() => router.push('/records/new/form')}
								/>
							</BaseCard>
						)
					return (
						<View className="mb-4">
							<BaseCard>
								<Text>Costs</Text>
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
						</View>
					)
				}}
				renderItem={({ item, index }) => (
					<RecordCard
						data={item}
						className={index ? 'mt-4' : ''}
						onPress={() => router.push(`/records/${item.id}`)}
					/>
				)}
			/>
			{data.length > 0 && (
				<BaseActions
					className="bottom-8"
					data={[
						{
							icon: 'plus',
							text: 'Record',
							onPress: () => router.push('/records/new/form'),
						},
					]}
				/>
			)}
		</View>
	)
}
