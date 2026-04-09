import { Fragment, useCallback } from 'react'
import { Alert, ScrollView, View } from 'react-native'

import { router, Stack, useLocalSearchParams } from 'expo-router'

import { usePatientMedicines } from '@/api/patient-medicines'
import { usePatient, usePatientActions } from '@/api/patients'
import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { FlashList } from '@/components/FlashList'
import { NoPatientMedicines } from '@/components/NoPatientMedicines'
import { PatientMedicineCard } from '@/components/PatientMedicineCard'
import { Avatar } from '@/components/ui/avatar'
import { Divider } from '@/components/ui/divider'
import { Subtitle, Text, Title } from '@/components/ui/text'
import { $d, $df } from '@/utils/dayjs'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = usePatient(Number(id))
	const { remove } = usePatientActions(Number(id))
	const { data: medicines } = usePatientMedicines({ patientId: Number(id) })

	const onDelete = useCallback(() => {
		Alert.alert('Delete', 'Are you sure you want to delete this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				onPress: () => {
					remove()
					router.back()
				},
			},
		])
	}, [remove])

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
						image={data.avatar?.uri}
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
