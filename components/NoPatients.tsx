import { router } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseButton } from './base/button'
import { BaseCard } from './base/card'
import { Icon } from './ui/icon'
import { Subtitle, Title } from './ui/text'

export const NoPatients = ({ className }: { className?: string }) => {
	return (
		<BaseCard className={cn('items-center py-12', className)}>
			<Icon className="text-6xl" name="user-x" />
			<Title className="mt-4">No patients found!</Title>
			<Subtitle>Add a new patient to get started</Subtitle>
			<BaseButton
				pill
				title="Add Patient"
				className="mt-4"
				prependIcon="plus"
				onPress={() => router.push('/patients/new/form')}
			/>
		</BaseCard>
	)
}
