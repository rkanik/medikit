import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Alert, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { BaseActions } from '@/components/base/actions'
import { BaseButton } from '@/components/base/button'
import { BaseCard } from '@/components/base/card'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseModal } from '@/components/base/modal'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Avatar } from '@/components/ui/avatar'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Icon } from '@/components/ui/icon'
import { Pressable } from '@/components/ui/pressable'
import { Spinner } from '@/components/ui/spinner'
import { Subtitle, Text } from '@/components/ui/text'
import { usePatientIdParam } from '@/hooks/usePatientIdParam'
import { usePatientPregnancyDeleteMutation } from '@/mutations/usePatientPregnancyDeleteMutation'
import {
	usePatientPregnancyMutation,
	type TZPatientPregnancy,
} from '@/mutations/usePatientPregnancyMutation'
import { useLinkablePregnancyPatientsQuery } from '@/queries/useLinkablePregnancyPatientsQuery'
import { useInvalidatePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'
import { usePatientPregnancyByIdQuery } from '@/queries/usePatientPregnancyByIdQuery'
import { usePatientsListQuery } from '@/queries/usePatientsListQuery'
import { paths } from '@/utils/paths'

type TFormValues = {
	id?: number | null
	patientId: number
	fatherPatientId?: number | null
	expectedDate?: string | null
	deliveryDate?: string | null
	childIds: number[]
}

type TPickerMode = 'baby' | 'father'

export default function Screen() {
	const { pid } = useLocalSearchParams()
	const isNew = pid === 'new'
	const pregnancyId = Number(pid)
	const { patientId, isValid: hasPatientId } = usePatientIdParam()
	const { data, isPending } = usePatientPregnancyByIdQuery(pregnancyId)
	const { data: patients = [] } = usePatientsListQuery()
	const { data: linkablePatients = [] } = useLinkablePregnancyPatientsQuery({
		excludePatientId: patientId,
		excludePregnancyId: isNew ? null : pregnancyId,
	})
	const { mutateAsync: submitPregnancy } = usePatientPregnancyMutation()
	const { mutateAsync: deletePregnancy } = usePatientPregnancyDeleteMutation()
	const invalidatePregnancies = useInvalidatePatientPregnanciesQuery()
	const [pickerMode, setPickerMode] = useState<TPickerMode | null>(null)

	const initialValues = useMemo<TFormValues>(() => {
		if (data) {
			return {
				id: data.id,
				patientId: data.patientId ?? patientId,
				fatherPatientId: data.fatherPatientId ?? null,
				expectedDate: data.expectedDate,
				deliveryDate: data.deliveryDate,
				childIds:
					data.children
						?.map(link => link.childPatientId)
						.filter((id): id is number => id != null) ?? [],
			}
		}
		return {
			patientId,
			fatherPatientId: null,
			expectedDate: null,
			deliveryDate: null,
			childIds: [],
		}
	}, [data, patientId])

	const form = useForm<TFormValues>({
		defaultValues: initialValues,
	})

	const lastDataId = useRef<number | null>(null)
	useLayoutEffect(() => {
		if (!data?.id || data.id === lastDataId.current) return
		lastDataId.current = data.id
		form.reset(initialValues)
	}, [data, form, initialValues])

	useLayoutEffect(() => {
		if (hasPatientId && isNew) {
			form.setValue('patientId', patientId)
		}
	}, [form, hasPatientId, isNew, patientId])

	const childIds = form.watch('childIds')
	const fatherPatientId = form.watch('fatherPatientId')

	const patientsById = useMemo(() => {
		const byId = new Map(patients.map(patient => [patient.id, patient]))
		for (const patient of linkablePatients) {
			byId.set(patient.id, patient)
		}
		if (data?.father?.id != null) {
			byId.set(data.father.id, data.father as (typeof patients)[number])
		}
		for (const link of data?.children ?? []) {
			if (link.child?.id != null) {
				byId.set(link.child.id, link.child as (typeof patients)[number])
			}
		}
		return byId
	}, [patients, linkablePatients, data?.father, data?.children])

	const selectedFather = useMemo(() => {
		if (fatherPatientId == null) return null
		return patientsById.get(fatherPatientId) ?? null
	}, [fatherPatientId, patientsById])

	const selectedChildren = useMemo(() => {
		return (childIds ?? [])
			.map(id => patientsById.get(id))
			.filter((patient): patient is NonNullable<typeof patient> => !!patient)
	}, [childIds, patientsById])

	const availableChildren = useMemo(
		() =>
			linkablePatients.filter(
				patient =>
					!(childIds ?? []).includes(patient.id) &&
					patient.id !== fatherPatientId,
			),
		[childIds, fatherPatientId, linkablePatients],
	)

	const availableFathers = useMemo(
		() =>
			patients.filter(
				patient =>
					patient.id !== patientId &&
					!(childIds ?? []).includes(patient.id) &&
					patient.id !== fatherPatientId &&
					(patient.gender ?? '').toLowerCase() === 'male',
			),
		[childIds, fatherPatientId, patientId, patients],
	)

	const pickerOptions =
		pickerMode === 'father' ? availableFathers : availableChildren

	const onAddChild = useCallback(
		(childId?: number) => {
			if (!childId) return
			const current = form.getValues('childIds') ?? []
			if (current.includes(childId)) return
			form.setValue('childIds', [...current, childId])
			setPickerMode(null)
		},
		[form],
	)

	const onSelectFather = useCallback(
		(nextFatherId?: number) => {
			if (!nextFatherId) return
			form.setValue('fatherPatientId', nextFatherId)
			setPickerMode(null)
		},
		[form],
	)

	const onRemoveChild = useCallback(
		(childId: number) => {
			const current = form.getValues('childIds') ?? []
			form.setValue(
				'childIds',
				current.filter(id => id !== childId),
			)
		},
		[form],
	)

	const onClearFather = useCallback(() => {
		form.setValue('fatherPatientId', null)
	}, [form])

	const onPressAddBaby = useCallback(() => {
		setPickerMode('baby')
	}, [])

	const onPressFather = useCallback(() => {
		setPickerMode('father')
	}, [])

	const onSubmit = useCallback(
		async (values: TFormValues) => {
			if (!hasPatientId) {
				form.setError('root', { message: 'Patient is required.' })
				return
			}
			if (!values.expectedDate && !values.deliveryDate) {
				form.setError('root', {
					message: 'Add expected or delivery date.',
				})
				return
			}
			try {
				const payload: TZPatientPregnancy = {
					id: values.id,
					patientId,
					fatherPatientId: values.fatherPatientId,
					expectedDate: values.expectedDate,
					deliveryDate: values.deliveryDate,
					childIds: values.childIds ?? [],
				}
				await submitPregnancy(payload)
				invalidatePregnancies()
				router.back()
			} catch (error: any) {
				form.setError('root', { message: error.message })
			}
		},
		[form, hasPatientId, invalidatePregnancies, patientId, submitPregnancy],
	)

	const onRemove = useCallback(() => {
		Alert.alert('Remove', 'Are you sure you want to remove this pregnancy?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Remove',
				onPress: async () => {
					if (!data?.id) return
					await deletePregnancy(data.id)
					invalidatePregnancies()
					router.back()
				},
			},
		])
	}, [data?.id, deletePregnancy, invalidatePregnancies])

	if (!isNew && isPending) {
		return (
			<View className="flex-1 items-center justify-center p-4">
				<Stack.Screen options={{ title: 'Loading...' }} />
				<Spinner size="large" />
			</View>
		)
	}

	if (!isNew && !data) {
		return (
			<View className="flex-1 p-4">
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Text>Pregnancy not found!</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingScrollView>
			<Stack.Screen
				options={{
					title: data ? 'Update Pregnancy' : 'New Pregnancy',
				}}
			/>
			<FormProvider {...form}>
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					className="px-4 pt-4 pb-32 flex justify-end flex-1 gap-4"
				>
					<Grid cols={2} gap={16}>
						<GridItem>
							<BaseDatePicker
								name="expectedDate"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								label="Expected Date"
								control={form.control}
							/>
						</GridItem>
						<GridItem>
							<BaseDatePicker
								name="deliveryDate"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								label="Delivery Date"
								control={form.control}
							/>
						</GridItem>
						<GridItem colSpan={2}>
							<Text className="mb-1 text-base font-medium">Father</Text>
							<Grid cols={3} gap={10}>
								{selectedFather ? (
									<GridItem className="aspect-square">
										<BaseCard
											onPress={onPressFather}
											className="h-full rounded-xl bg-secondary dark:bg-secondary items-center justify-center p-2"
										>
											<Pressable
												onPress={onClearFather}
												className="absolute right-1 top-1 z-10 h-5 w-5 items-center justify-center rounded-full bg-neutral-500/80"
											>
												<Icon name="x" className="text-white text-xs" />
											</Pressable>
											<Avatar
												className="h-10 w-10"
												textClassName="text-sm"
												text={selectedFather.name}
												image={paths.document(selectedFather.avatar?.uri)}
											/>
											<Text
												className="mt-1.5 text-center text-sm"
												numberOfLines={2}
											>
												{selectedFather.name}
											</Text>
										</BaseCard>
									</GridItem>
								) : (
									<GridItem className="aspect-square">
										<BaseButton
											size="xl"
											prependIcon="plus"
											prependIconClassName="text-3xl"
											variant="secondary"
											className="h-full rounded-xl"
											onPress={onPressFather}
										/>
									</GridItem>
								)}
							</Grid>
						</GridItem>
						<GridItem colSpan={2}>
							<Text className="mb-1 text-base font-medium">Babies</Text>
							<Grid cols={3} gap={10}>
								{selectedChildren.map(child => (
									<GridItem key={child.id} className="aspect-square">
										<View className="h-full rounded-xl bg-secondary overflow-hidden items-center justify-center p-2">
											<Pressable
												onPress={() => onRemoveChild(child.id)}
												className="absolute right-1 top-1 z-10 h-5 w-5 items-center justify-center rounded-full bg-neutral-500/80"
											>
												<Icon name="x" className="text-white text-xs" />
											</Pressable>
											<Avatar
												className="h-10 w-10"
												textClassName="text-sm"
												text={child.name}
												image={paths.document(child.avatar?.uri)}
											/>
											<Text
												className="mt-1.5 text-center text-sm"
												numberOfLines={2}
											>
												{child.name}
											</Text>
										</View>
									</GridItem>
								))}
								<GridItem className="aspect-square">
									<BaseButton
										size="xl"
										prependIcon="plus"
										prependIconClassName="text-3xl"
										variant="secondary"
										className="h-full rounded-xl"
										onPress={onPressAddBaby}
									/>
								</GridItem>
							</Grid>
						</GridItem>
					</Grid>
					{form.formState.errors.root?.message ? (
						<Text className="text-red-500">
							{form.formState.errors.root.message}
						</Text>
					) : null}
					<BaseActions
						className="relative justify-end px-0"
						data={[
							{
								pill: true,
								prependIcon: 'x',
								onPress: () => router.back(),
							},
							{
								pill: true,
								variant: 'destructive',
								prependIcon: 'trash',
								hidden: !data?.id,
								onPress: onRemove,
							},
							{
								pill: true,
								prependIcon: 'check-circle',
								title: 'Submit',
								onPress(e) {
									form.handleSubmit(onSubmit)(e)
								},
							},
						]}
					/>
				</Form>
			</FormProvider>

			{pickerMode ? (
				<BaseModal
					visible={!!pickerMode}
					setVisible={visible => {
						if (!visible) setPickerMode(null)
					}}
					height={
						pickerOptions.length
							? Math.min(480, 80 + pickerOptions.length * 72)
							: 220
					}
				>
					<View className="px-4 pb-8 pt-2 gap-2">
						<Text className="mb-1 text-lg font-semibold">
							{pickerMode === 'father' ? 'Select father' : 'Select baby'}
						</Text>
						{pickerOptions.length ? (
							pickerOptions.map(item => (
								<BaseCard
									key={item.id}
									onPress={() =>
										pickerMode === 'father'
											? onSelectFather(item.id)
											: onAddChild(item.id)
									}
									className="flex-row items-center gap-3 rounded-xl px-3 py-3"
								>
									<Avatar
										className="h-10 w-10"
										text={item.name}
										image={paths.document(item.avatar?.uri)}
									/>
									<Text className="flex-1 text-lg">{item.name}</Text>
									<Icon name="plus" className="text-lg opacity-60" />
								</BaseCard>
							))
						) : (
							<View className="items-center py-8 px-4">
								<Icon name="user-x" className="text-4xl opacity-50" />
								<Text className="mt-3 text-center text-base font-medium">
									No patients available
								</Text>
								<Subtitle className="mt-1 text-center">
									{pickerMode === 'father'
										? 'Add a male patient to select as father.'
										: 'Add another patient to link as a baby.'}
								</Subtitle>
							</View>
						)}
					</View>
				</BaseModal>
			) : null}
		</KeyboardAvoidingScrollView>
	)
}
