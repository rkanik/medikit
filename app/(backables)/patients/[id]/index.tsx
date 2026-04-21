import { Fragment, useCallback } from 'react'
import { Alert, ScrollView, View } from 'react-native'

import { router, Stack, useLocalSearchParams } from 'expo-router'

import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { FlashList } from '@/components/FlashList'
import { NoPatientMedicines } from '@/components/NoPatientMedicines'
import { PatientMedicineCard } from '@/components/PatientMedicineCard'
import { Avatar } from '@/components/ui/avatar'
import { Divider } from '@/components/ui/divider'
import { Subtitle, Text, Title } from '@/components/ui/text'
import { useDeletePatientsMutation } from '@/mutations/useDeletePatientsMutation'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { usePatientMedicinesQuery } from '@/queries/usePatientMedicinesQuery'
import { useInvalidatePatientsQuery } from '@/queries/usePatientsQuery'
import { $d, $df } from '@/utils/dayjs'
import { paths } from '@/utils/paths'

/** Gestational age from EDD (40 weeks from LMP ≈ 280 days). */
function gestationalAgeParts(edd: string) {
	const today = $d().startOf('day')
	const due = $d(edd).startOf('day')
	const daysUntilDue = due.diff(today, 'day')
	const gestationalDays = Math.max(0, 280 - daysUntilDue)
	const weeks = Math.floor(gestationalDays / 7)
	const weekDays = gestationalDays % 7
	const months = Math.floor(gestationalDays / 30)
	const monthDays = gestationalDays % 30
	return { weeks, weekDays, months, monthDays }
}

function plural(n: number, one: string, many: string) {
	return `${n} ${n === 1 ? one : many}`
}

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = usePatientByIdQuery(Number(id))
	const { mutate: deletePatient } = useDeletePatientsMutation()
	const { data: medicinesData } = usePatientMedicinesQuery({
		patientId: Number(id),
	})
	const invalidatePatientsQuery = useInvalidatePatientsQuery()
	const medicines = medicinesData.filter(item => !!item.medicine)

	const onDelete = useCallback(() => {
		Alert.alert('Delete', 'Are you sure you want to delete this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				onPress: () => {
					deletePatient(Number(id), {
						onSuccess() {
							invalidatePatientsQuery()
							router.back()
						},
					})
				},
			},
		])
	}, [id, deletePatient, invalidatePatientsQuery])

	if (!data) {
		return (
			<Fragment>
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<View className="flex-1 px-5">
					<Text>Patient not found!</Text>
				</View>
			</Fragment>
		)
	}

	let eddListText: string | undefined
	if (data.edd) {
		const { weeks, weekDays, months, monthDays } = gestationalAgeParts(data.edd)
		const weeksStr = `${plural(weeks, 'week', 'weeks')} ${plural(weekDays, 'day', 'days')}`
		const monthsStr = `${plural(months, 'month', 'months')} ${plural(monthDays, 'day', 'days')}`
		eddListText = `${$df(data.edd, 'DD MMMM, YYYY')} (${weeksStr}, ${monthsStr})`
	}

	return (
		<View className="flex-1">
			<Stack.Screen options={{ title: 'Patient Details' }} />
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
					<View className="dark:bg-neutral-800 rounded-lg mt-2">
						<BaseListItem text={data.name} icon="user" label="Name" />
						{data.dob && (
							<Fragment>
								<Divider />
								<BaseListItem
									text={$df(data.dob, 'DD MMMM, YYYY')}
									icon="calendar"
									label="Date of Birth"
								/>
							</Fragment>
						)}
						{data.gender && (
							<Fragment>
								<Divider />
								<BaseListItem text={data.gender} icon="user" label="Gender" />
							</Fragment>
						)}
						{eddListText && (
							<Fragment>
								<Divider />
								<BaseListItem
									text={eddListText}
									icon="calendar"
									label="Expected Delivery Date"
								/>
							</Fragment>
						)}
					</View>
				</View>

				<View className="mt-8">
					<Text className="uppercase text-sm tracking-wide ml-2">
						Medicines
					</Text>
					<FlashList
						data={medicines}
						keyExtractor={item => item.id?.toString() ?? ''}
						contentContainerStyle={{ flexGrow: 1 }}
						className="mt-2"
						renderItem={({ item, index }) => (
							<PatientMedicineCard
								data={item}
								className={index ? 'mt-2' : ''}
								onPress={() =>
									router.push(`/patients/${id}/medicines/${item.id}/form`)
								}
							/>
						)}
						ListFooterComponent={() => {
							if (!medicines.length)
								return <NoPatientMedicines patientId={Number(id)} />
							return null
						}}
					/>
				</View>

				{/* <BaseJson data={data} /> */}
			</ScrollView>
			<BaseActions
				className="bottom-12"
				data={[
					{
						icon: 'trash',
						onPress: onDelete,
					},
					{
						icon: 'plus',
						text: 'Medicine',
						hidden: !medicines.length,
						onPress: () => router.push(`/patients/${id}/medicines/new/form`),
					},
					{
						icon: 'edit',
						text: 'Update',
						onPress: () => router.push(`/patients/${id}/form`),
					},
				]}
			/>
		</View>
	)
}
