import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseCard } from '@/components/base/card'
import { RecordCard } from '@/components/RecordCard'
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'

export default function Screen() {
	const { data, summary } = api.records.useRecords()
	return (
		<View className="flex-1 relative">
			<FlashList
				data={data}
				keyExtractor={item => item.id?.toString() ?? ''}
				contentContainerStyle={{ flexGrow: 1 }}
				contentContainerClassName={cn('flex-col-reverse px-4', {
					'pb-4': data.length === 0,
					'pb-28': data.length > 0,
				})}
				ListFooterComponent={() => {
					if (data.length === 0)
						return (
							<BaseCard className="items-center py-12">
								<Icon name="list-todo" size="32" color="white" />
								<Text size="lg" className="mt-2">
									No records found!
								</Text>
								<Text className="text-center">
									Add a new record to get started
								</Text>
								<Button
									size="xl"
									variant="solid"
									className="rounded-full mt-4"
									onPress={() => router.push('/records/new/form')}
								>
									<ButtonIcon name="plus" size="lg" />
									<ButtonText size="md">Add Record</ButtonText>
								</Button>
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
											<Text bold>{summary.total} TK</Text>
										</View>
										<View>
											<Text>This Month</Text>
											<Text bold>{summary.thisMonth} TK</Text>
										</View>
										<View>
											<Text>This Year</Text>
											<Text bold>{summary.thisYear} TK</Text>
										</View>
									</View>
									<View className="flex-row gap-8 flex-wrap">
										{Object.entries(summary.types).map(([type, amount]) => (
											<View key={type}>
												<Text>{type}</Text>
												<Text bold>{amount} TK</Text>
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
