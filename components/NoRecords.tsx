import { router } from 'expo-router'
import { BaseCard } from './base/card'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Subtitle, Title } from './ui/text'

export const NoRecords = () => {
	return (
		<BaseCard className="items-center py-12">
			<Icon className="text-6xl" name="slash" />
			<Title className="mt-4">No records found!</Title>
			<Subtitle>Add a new record to get started</Subtitle>
			<Button
				icon="plus"
				text="Add Record"
				className="mt-4"
				onPress={() => router.push('/records/new/form')}
			/>
		</BaseCard>
	)
}
