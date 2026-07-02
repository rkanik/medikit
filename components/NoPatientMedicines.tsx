import { router } from 'expo-router'

import { BaseCard } from './base/card'
import { BaseButton } from './base/button'
import { Subtitle, Title } from './ui/text'

type TNoPatientMedicinesProps = {
	patientId: number
}
export const NoPatientMedicines = ({ patientId }: TNoPatientMedicinesProps) => {
	return (
		<BaseCard className="items-center py-8">
			<Title>No medicines found!</Title>
			<Subtitle>Add a new medicine to get started</Subtitle>
			<BaseButton
				prependIcon="plus"
				title="Medicine"
				className="mt-4"
				onPress={() => router.push(`/patients/${patientId}/medicines/new/form`)}
			/>
		</BaseCard>
	)
}
