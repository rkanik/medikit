import { router } from 'expo-router'
import { BaseButton } from './base/button'
import { BaseCard } from './base/card'
import { Icon } from './ui/icon'
import { Subtitle, Title } from './ui/text'

export const NoRecords = () => {
	return (
		<BaseCard className="items-center py-12">
			<Icon className="text-6xl" name="slash" />
			<Title className="mt-4">No records found!</Title>
			<Subtitle>Add a new record to get started</Subtitle>
			<BaseButton
				pill
				prependIcon="plus"
				title="Add Record"
				className="mt-4"
				onPress={() => router.push('/records/new/form')}
			/>
		</BaseCard>
	)
}
