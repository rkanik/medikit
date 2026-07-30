import { Fragment, useCallback, useMemo, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { cn } from 'tailwind-variants'
import { BaseActions } from '@/components/base/actions'
import { BaseListItem } from '@/components/base/ListItem'
import { SegmentedTabs } from '@/components/base/SegmentedTabs'
import { FlashList } from '@/components/FlashList'
import { NoPatientMedicines } from '@/components/NoPatientMedicines'
import { NoPatientPregnancies } from '@/components/NoPatientPregnancies'
import { NoPatientTimeline } from '@/components/NoPatientTimeline'
import { PatientMedicineCard } from '@/components/PatientMedicineCard'
import { PatientPregnancyCard } from '@/components/PatientPregnancyCard'
import { PatientTimelineCard } from '@/components/PatientTimelineCard'
import { Avatar } from '@/components/ui/avatar'
import { Subtitle, Text, Title } from '@/components/ui/text'
import { useDeletePatientsMutation } from '@/mutations/useDeletePatientsMutation'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { usePatientMedicinesQuery } from '@/queries/usePatientMedicinesQuery'
import { usePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'
import { useInvalidatePatientsQuery } from '@/queries/usePatientsQuery'
import { usePatientTimelineQuery } from '@/queries/usePatientTimelineQuery'
import { $d, $daf, $df } from '@/utils/dayjs'
import { paths } from '@/utils/paths'
import {
	formatGestationalAge,
	gestationalAgeFromEdd,
	isCurrentlyPregnant,
} from '@/utils/pregnancy'

type TSectionTab = 'medicines' | 'timeline' | 'pregnancy'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const patientId = Number(id)
	const [sectionTab, setSectionTab] = useState<TSectionTab>('medicines')
	const { data } = usePatientByIdQuery(patientId)
	const { mutate: deletePatient } = useDeletePatientsMutation()
	const { data: medicinesData } = usePatientMedicinesQuery({
		patientId,
	})
	const { data: timelineData } = usePatientTimelineQuery({
		patientId,
	})
	const { data: pregnancies } = usePatientPregnanciesQuery({
		patientId,
	})
	const invalidatePatientsQuery = useInvalidatePatientsQuery()
	const medicines = medicinesData.filter(item => !!item.medicine)

	const activePregnancy = useMemo(() => {
		return pregnancies.find(pregnancy => isCurrentlyPregnant(pregnancy))
	}, [pregnancies])

	const runningWeeksText = useMemo(() => {
		if (!activePregnancy?.expectedDate) return null
		const age = gestationalAgeFromEdd(activePregnancy.expectedDate)
		if (!age) return null
		return formatGestationalAge(age)
	}, [activePregnancy])

	const showPregnancyTab = data?.gender === 'Female' || pregnancies.length > 0

	const sectionTabs = useMemo(() => {
		const tabs: { key: TSectionTab; title: string }[] = [
			{ key: 'medicines', title: 'Medicines' },
			{ key: 'timeline', title: 'Growth' },
		]
		if (showPregnancyTab) {
			tabs.push({ key: 'pregnancy', title: 'Pregnancy' })
		}
		return tabs
	}, [showPregnancyTab])

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
			<Fragment>
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<View className="flex-1 px-5">
					<Text>Patient not found!</Text>
				</View>
			</Fragment>
		)
	}

	const fabTitle =
		sectionTab === 'medicines'
			? 'Medicine'
			: sectionTab === 'timeline'
				? 'Growth'
				: 'Pregnancy'

	const fabHidden =
		sectionTab === 'medicines'
			? !medicines.length
			: sectionTab === 'timeline'
				? !timelineData.length
				: !pregnancies.length

	const onFabPress = () => {
		if (sectionTab === 'medicines') {
			router.push(`/patients/${id}/medicines/new/form`)
			return
		}
		if (sectionTab === 'timeline') {
			router.push(`/patients/${id}/timeline/new/form`)
			return
		}
		router.push(`/patients/${id}/pregnancies/new/form`)
	}

	return (
		<View className="flex-1">
			<Stack.Screen options={{ title: data.name }} />
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

				<View className="mt-4 gap-4">
					<SegmentedTabs
						value={
							!showPregnancyTab && sectionTab === 'pregnancy'
								? 'medicines'
								: sectionTab
						}
						items={sectionTabs}
						onChange={setSectionTab}
					/>
					{sectionTab === 'medicines' ? (
						<FlashList
							data={medicines}
							keyExtractor={item => item.id?.toString() ?? ''}
							contentContainerStyle={{ flexGrow: 1 }}
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
									return <NoPatientMedicines patientId={patientId} />
								return null
							}}
						/>
					) : sectionTab === 'timeline' ? (
						<FlashList
							data={timelineData}
							keyExtractor={item => item.id?.toString() ?? ''}
							contentContainerStyle={{ flexGrow: 1 }}
							renderItem={({ item, index }) => (
								<PatientTimelineCard
									data={item}
									previous={timelineData[index + 1]}
									dob={data.dob}
									gender={data.gender}
									isFirst={index === 0}
									isLast={index === timelineData.length - 1}
									className={cn({
										'mt-1': index > 0,
										'rounded-t-3xl': index === 0,
										'rounded-b-3xl': index === timelineData.length - 1,
									})}
									onPress={() =>
										router.push(`/patients/${id}/timeline/${item.id}/form`)
									}
								/>
							)}
							ListFooterComponent={() => {
								if (!timelineData.length)
									return <NoPatientTimeline patientId={patientId} />
								return null
							}}
						/>
					) : (
						<View>
							{pregnancies.length ? (
								pregnancies.map((item, index) => (
									<PatientPregnancyCard
										key={item.id}
										data={item}
										className={cn({
											'mt-1': index > 0,
											'rounded-t-3xl': index === 0,
											'rounded-b-3xl': index === pregnancies.length - 1,
										})}
										onPress={() =>
											router.push(`/patients/${id}/pregnancies/${item.id}/form`)
										}
									/>
								))
							) : (
								<NoPatientPregnancies patientId={patientId} />
							)}
						</View>
					)}
				</View>
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
						title: fabTitle,
						hidden: fabHidden,
						onPress: onFabPress,
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
