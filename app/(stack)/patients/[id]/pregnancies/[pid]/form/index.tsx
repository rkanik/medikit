import { useCallback, useEffect, useMemo } from 'react'
import { Alert, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { BaseActions } from '@/components/base/actions'
import { BaseButton } from '@/components/base/button'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Avatar } from '@/components/ui/avatar'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'
import { usePatientPregnancyDeleteMutation } from '@/mutations/usePatientPregnancyDeleteMutation'
import {
	usePatientPregnancyMutation,
	type TZPatientPregnancy,
} from '@/mutations/usePatientPregnancyMutation'
import { useInvalidatePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'
import { usePatientPregnancyByIdQuery } from '@/queries/usePatientPregnancyByIdQuery'
import { usePatientsListQuery } from '@/queries/usePatientsListQuery'
import { paths } from '@/utils/paths'

type TFormValues = {
	id?: number | null
	patientId: number
	expectedDate?: string | null
	deliveryDate?: string | null
	childIds: number[]
	addChildId?: number | null
}

export default function Screen() {
	const { id, pid } = useLocalSearchParams()
	const patientId = Number(id)
	const { data } = usePatientPregnancyByIdQuery(Number(pid))
	const { data: patients } = usePatientsListQuery()
	const { mutateAsync: submitPregnancy } = usePatientPregnancyMutation()
	const { mutateAsync: deletePregnancy } = usePatientPregnancyDeleteMutation()
	const invalidatePregnancies = useInvalidatePatientPregnanciesQuery()

	const childOptions = useMemo(
		() => patients.filter(patient => patient.id !== patientId),
		[patients, patientId],
	)

	const form = useForm<TFormValues>({
		defaultValues: {
			patientId,
			expectedDate: null,
			deliveryDate: null,
			childIds: [],
			addChildId: null,
		},
	})

	const childIds = form.watch('childIds') ?? []

	const selectedChildren = useMemo(
		() => childOptions.filter(patient => childIds.includes(patient.id)),
		[childIds, childOptions],
	)

	const availableChildren = useMemo(
		() => childOptions.filter(patient => !childIds.includes(patient.id)),
		[childIds, childOptions],
	)

	const onAddChild = useCallback(
		(childId?: number) => {
			if (!childId) return
			const current = form.getValues('childIds') ?? []
			if (current.includes(childId)) return
			form.setValue('childIds', [...current, childId])
			form.setValue('addChildId', null)
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

	const onSubmit = useCallback(
		async (values: TFormValues) => {
			if (!values.expectedDate && !values.deliveryDate) {
				form.setError('root', {
					message: 'Add expected or delivery date.',
				})
				return
			}
			try {
				const payload: TZPatientPregnancy = {
					id: values.id,
					patientId: values.patientId,
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
		[form, invalidatePregnancies, submitPregnancy],
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

	useEffect(() => {
		if (data) {
			form.reset({
				id: data.id,
				patientId: data.patientId ?? patientId,
				expectedDate: data.expectedDate,
				deliveryDate: data.deliveryDate,
				childIds:
					data.children
						?.map(link => link.childPatientId)
						.filter((id): id is number => id != null) ?? [],
				addChildId: null,
			})
		}
	}, [data, form, patientId])

	if (pid !== 'new' && !data) {
		return (
			<View className="flex-1 px-4">
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
							<BaseSelect
								name="addChildId"
								label="Baby"
								placeholder="Select a child patient..."
								control={form.control}
								options={availableChildren}
								getOptionValue={item => item?.id}
								getOptionLabel={item => (
									<View className="flex-row items-center gap-3">
										<Avatar
											className="h-8 w-8"
											text={item?.name}
											image={paths.document(item?.avatar?.uri)}
										/>
										<Text className="text-lg">{item?.name}</Text>
									</View>
								)}
								onChange={onAddChild}
							/>
							{selectedChildren.length > 0 ? (
								<View className="mt-3 gap-2">
									{selectedChildren.map(child => (
										<View
											key={child.id}
											className="flex-row items-center gap-3 rounded-lg bg-secondary px-3 py-2"
										>
											<Avatar
												className="h-8 w-8"
												text={child.name}
												image={paths.document(child.avatar?.uri)}
											/>
											<Text className="flex-1 text-base">{child.name}</Text>
											<BaseButton
												pill
												size="icon-xs"
												variant="secondary"
												prependIcon="x"
												onPress={() => onRemoveChild(child.id)}
											/>
										</View>
									))}
								</View>
							) : null}
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
		</KeyboardAvoidingScrollView>
	)
}
