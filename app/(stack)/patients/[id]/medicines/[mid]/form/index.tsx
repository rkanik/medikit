import { useCallback, useEffect } from 'react'
import { Alert, View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { BaseActions } from '@/components/base/actions'
import { BaseButton } from '@/components/base/button'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'
import { useDeleteMedicineMutation } from '@/mutations/useDeleteMedicineMutation'
import { usePatientMedicineDeleteMutation } from '@/mutations/usePatientMedicineDeleteMutation'
import {
	usePatientMedicineMutation,
	zPatientMedicine,
	type TZPatientMedicine,
} from '@/mutations/usePatientMedicineMutation'
import { useMedicinesQuery } from '@/queries/useMedicinesQuery'
import { usePatientMedicineByIdQuery } from '@/queries/usePatientMedicineByIdQuery'
import { paths } from '@/utils/paths'

export default function Screen() {
	const { id, mid } = useLocalSearchParams()
	const { data } = usePatientMedicineByIdQuery(Number(mid))

	const { data: medicines, refetch: refetchMedicines } = useMedicinesQuery()
	const { mutateAsync: deleteMedicine } = useDeleteMedicineMutation()
	const { mutateAsync: submitPatientMedicine } = usePatientMedicineMutation()
	const { mutateAsync: deletePatientMedicine } =
		usePatientMedicineDeleteMutation()

	const form = useForm({
		resolver: zodResolver(zPatientMedicine),
		defaultValues: {
			patientId: Number(id),
			medicine: {
				name: '',
			},
		},
	})

	const onSubmit = useCallback(
		async (data: TZPatientMedicine) => {
			try {
				await submitPatientMedicine(data)
				router.back()
			} catch (error: any) {
				form.setError('root', {
					message: error.message,
				})
			}
		},
		[form, submitPatientMedicine],
	)

	const onChangeMedicineId = useCallback(
		(key?: number) => {
			const medicine = medicines.find(v => v.id === key)
			if (medicine) {
				form.setValue('medicine.name', medicine.name)
				form.setValue('medicine.thumbnail', medicine.thumbnail)
			}
		},
		[form, medicines],
	)

	const onChangeMedicineName = useCallback(
		(name: string) => {
			const medicine = medicines.find(v => v.name === name)
			form.setValue('medicine.id', medicine?.id)
			form.setValue('medicine.thumbnail', medicine?.thumbnail)
		},
		[form, medicines],
	)

	const onRemove = useCallback(() => {
		Alert.alert('Remove', 'Are you sure you want to remove this medicine?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Remove',
				onPress: async () => {
					if (!data?.id) return
					await deletePatientMedicine(data.id)
					router.back()
				},
			},
		])
	}, [deletePatientMedicine, data?.id])

	const onRemoveMedicine = useCallback(
		(id?: number) => {
			return async (e?: any) => {
				e?.preventDefault?.()
				e?.stopPropagation?.()
				if (!id) return
				try {
					Alert.alert(
						'Remove',
						'Are you sure you want to remove this medicine?',
						[
							{ text: 'Cancel', style: 'cancel' },
							{
								text: 'Remove',
								onPress() {
									deleteMedicine(id, {
										onSuccess() {
											refetchMedicines()
										},
									})
								},
							},
						],
					)
				} catch (error: any) {
					Alert.alert('Error', error?.message ?? 'Failed to remove medicine.')
				}
			}
		},
		[deleteMedicine, refetchMedicines],
	)

	useEffect(() => {
		if (data) {
			form.reset({
				id: data.id,
				patientId: data.patientId ?? Number(id),
				startDate: data.startDate,
				endDate: data.endDate,
				schedule: data.schedule,
				stock: data.stock,
				medicine: {
					id: data.medicine?.id,
					name: data.medicine?.name ?? '',
					thumbnail: data.medicine?.thumbnail,
				},
			})
		}
	}, [form, data, id])

	if (mid !== 'new' && !data) {
		return (
			<View className="flex-1 px-4">
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Text>Medicine not found!</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingScrollView>
			<Stack.Screen
				options={{
					title: data ? `Update Medicine` : `New Medicine`,
				}}
			/>
			<FormProvider {...form}>
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					className="px-4 pt-4 pb-32 flex justify-end flex-1 gap-4"
				>
					{/* <BaseJson data={values} /> */}
					<Grid cols={2} gap={16}>
						<GridItem colSpan={2}>
							<BaseImagePicker
								name="medicine.thumbnail"
								label="Thumbnail"
								control={form.control}
								aspect={[1, 1]}
								multiple={false}
							/>
						</GridItem>
						<GridItem colSpan={2} className="flex-row gap-2">
							<BaseInput
								required
								name="medicine.name"
								label="Medicine"
								control={form.control}
								className="flex-1"
								onChangeText={onChangeMedicineName}
							/>
							<BaseSelect
								name="medicine.id"
								control={form.control}
								options={medicines}
								getOptionLabel={item => (
									<View className="flex-row items-center gap-4 overflow-hidden">
										<Avatar
											className="w-8 h-8 flex-none"
											image={paths.document(item?.thumbnail?.uri)}
										/>
										<Text className="text-lg flex-1" numberOfLines={1}>
											{item?.name}
										</Text>
										{!item?.patientMedicines?.length ? (
											<BaseButton
												pill
												size="icon-xs"
												variant="secondary"
												className="flex-none"
												prependIcon="trash"
												onPress={onRemoveMedicine(item?.id)}
											/>
										) : null}
									</View>
								)}
								getOptionValue={item => item?.id}
								onChange={onChangeMedicineId}
								trigger={v => (
									<BaseButton
										{...v}
										size="icon-lg"
										className="mt-8"
										prependIcon="chevron-down"
										prependIconClassName="text-xl"
									/>
								)}
							/>
						</GridItem>
						<GridItem>
							<BaseInput
								name="schedule"
								label="Schedule"
								control={form.control}
							/>
						</GridItem>
						<GridItem>
							<BaseInput
								name="stock"
								label="Stock"
								keyboardType="numeric"
								control={form.control}
							/>
						</GridItem>
						<GridItem>
							<BaseDatePicker
								name="startDate"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								label="Start Date"
								control={form.control}
							/>
						</GridItem>
						<GridItem>
							<BaseDatePicker
								name="endDate"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								label="End Date"
								control={form.control}
							/>
						</GridItem>
					</Grid>
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
