import { Fragment, useCallback, useMemo } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { Avatar } from '@/components/ui/avatar'
import { Subtitle, Text, Title } from '@/components/ui/text'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { useDeletePatientsMutation } from '@/mutations/useDeletePatientsMutation'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { usePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'
import { useInvalidatePatientsQuery } from '@/queries/usePatientsQuery'
import { $d, $daf, $df } from '@/utils/dayjs'
import { paths } from '@/utils/paths'
import {
	formatGestationalAge,
	gestationalAgeFromEdd,
	isCurrentlyPregnant,
} from '@/utils/pregnancy'

export default function PatientInfoScreen() {
	const { id, patientId } = usePatientIdParam()
	const { data } = usePatientByIdQuery(patientId)
	const { mutate: deletePatient } = useDeletePatientsMutation()
	const invalidatePatientsQuery = useInvalidatePatientsQuery()
	const { data: pregnanciesData } = usePatientPregnanciesQuery({
		patientId,
		perPage: 20,
	})

	const pregnancies = useMemo(() => {
		return (pregnanciesData?.pages ?? []).flatMap(page => page.data ?? [])
	}, [pregnanciesData?.pages])

	const activePregnancy = useMemo(() => {
		return pregnancies.find(pregnancy => isCurrentlyPregnant(pregnancy))
	}, [pregnancies])

	const runningWeeksText = useMemo(() => {
		if (!activePregnancy?.expectedDate) return null
		const age = gestationalAgeFromEdd(activePregnancy.expectedDate)
		if (!age) return null
		return formatGestationalAge(age)
	}, [activePregnancy])

	const onDelete = useCallback(() => {
		Alert.alert('Delete', 'Are you sure you want to delete this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				onPress: () => {
					deletePatient(patientId, {
						onSuccess() {
							invalidatePatientsQuery()
							router.back()
						},
					})
				},
			},
		])
	}, [patientId, deletePatient, invalidatePatientsQuery])

	if (!data) {
		return (
			<View className="flex-1 px-5">
				<Text>Patient not found!</Text>
			</View>
		)
	}

	return (
		<>
			<Stack.Screen options={{ title: 'Basic' }} />
			<View className="flex-1">
				<ScrollView
					contentContainerClassName="px-4 pb-32 justify-end"
					contentContainerStyle={{ flexGrow: 1 }}
				>
					<View className="items-center">
						<Avatar
							className="h-24 w-24"
							textClassName="text-2xl"
							text={data.name}
							image={paths.document(data.avatar?.uri)}
						/>
						<Title className="mt-5 text-2xl">{data.name}</Title>
						{data.dob && (
							<Subtitle>
								{$df(data.dob, 'DD MMMM, YYYY')} ({$d().diff(data.dob, 'years')}
								yrs)
							</Subtitle>
						)}
					</View>

					<View className="mt-8">
						<Text className="uppercase text-sm tracking-wide ml-2">Basic</Text>
						<View className="rounded-3xl mt-2 gap-1 overflow-hidden">
							<BaseListItem
								text={data.name}
								icon="user"
								label="Name"
								className="bg-white dark:bg-neutral-800 rounded-lg"
							/>
							{data.dob && (
								<Fragment>
									<BaseListItem
										text={$df(data.dob, 'DD MMMM, YYYY')}
										icon="calendar"
										label="Date of Birth"
										className="bg-white dark:bg-neutral-800 rounded-lg"
									/>
									<BaseListItem
										text={$daf(data.dob)}
										icon="clock"
										label="Age"
										className="bg-white dark:bg-neutral-800 rounded-lg"
									/>
								</Fragment>
							)}
							{data.gender && (
								<BaseListItem
									text={data.gender}
									icon="user"
									label="Gender"
									className="bg-white dark:bg-neutral-800 rounded-lg"
								/>
							)}
							{runningWeeksText ? (
								<BaseListItem
									text={runningWeeksText}
									icon="calendar"
									label="Gestational Age"
									className="bg-white dark:bg-neutral-800 rounded-lg"
								/>
							) : null}
						</View>
					</View>
				</ScrollView>
				<BaseActions
					className="bottom-8"
					data={[
						{
							pill: true,
							variant: 'destructive',
							prependIcon: 'trash',
							onPress: onDelete,
						},
						{
							pill: true,
							prependIcon: 'edit',
							title: 'Update',
							onPress: () => router.push(`/patients/${id}/form`),
						},
					]}
				/>
			</View>
		</>
	)
}
