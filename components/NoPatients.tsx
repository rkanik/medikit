import { router } from 'expo-router'
import { BaseCard } from './base/card'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Subtitle, Title } from './ui/text'

export const NoPatients = () => {
	return (
		<BaseCard className="items-center py-12">
			<Icon className="text-6xl" name="user-x" />
			<Title className="mt-4">No patients found!</Title>
			<Subtitle>Add a new patient to get started</Subtitle>
			<Button
				icon="plus"
				text="Add Patient"
				className="mt-4"
				onPress={() => router.push('/patients/new/form')}
			/>
		</BaseCard>
	)
}
