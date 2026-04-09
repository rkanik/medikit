import { router } from 'expo-router'

import { BaseCard } from './base/card'
import { Button } from './ui/button'
import { Subtitle, Title } from './ui/text'

type TNoPatientMedicinesProps = {
	patientId: number
}
export const NoPatientMedicines = ({ patientId }: TNoPatientMedicinesProps) => {
	return (
		<BaseCard className="items-center py-8">
			<Title>No medicines found!</Title>
			<Subtitle>Add a new medicine to get started</Subtitle>
			<Button
				icon="plus"
				text="Medicine"
				className="mt-4"
				onPress={() => router.push(`/patients/${patientId}/medicines/new/form`)}
			/>
		</BaseCard>
	)
}
