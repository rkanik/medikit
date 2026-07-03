import { Fragment, useCallback } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { FlashList } from '@/components/FlashList'
import { NoPatientMedicines } from '@/components/NoPatientMedicines'
import { PatientMedicineCard } from '@/components/PatientMedicineCard'
import { Avatar } from '@/components/ui/avatar'
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
					<View className="rounded-3xl mt-2 gap-1 overflow-hidden ">
						<BaseListItem
							text={data.name}
							icon="user"
							label="Name"
							className="dark:bg-neutral-800 rounded-lg"
						/>
						{data.dob && (
							<Fragment>
								<BaseListItem
									text={$df(data.dob, 'DD MMMM, YYYY')}
									icon="calendar"
									label="Date of Birth"
									className="dark:bg-neutral-800 rounded-lg"
								/>
							</Fragment>
						)}
						{data.gender && (
							<Fragment>
								<BaseListItem
									text={data.gender}
									icon="user"
									label="Gender"
									className="dark:bg-neutral-800 rounded-lg"
								/>
							</Fragment>
						)}
						{eddListText && (
							<Fragment>
								<BaseListItem
									text={eddListText}
									icon="calendar"
									label="Expected Delivery Date"
									className="dark:bg-neutral-800 rounded-lg"
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
								className={cn({
									'mt-1': index > 0,
									'rounded-t-3xl': index === 0,
									'rounded-b-3xl': index === medicines.length - 1,
								})}
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
						pill: true,
						variant: 'destructive',
						prependIcon: 'trash',
						onPress: onDelete,
					},
					{
						pill: true,
						prependIcon: 'plus',
						title: 'Medicine',
						hidden: !medicines.length,
						onPress: () => router.push(`/patients/${id}/medicines/new/form`),
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
	)
}
