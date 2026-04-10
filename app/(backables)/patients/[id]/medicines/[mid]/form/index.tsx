import type { TZPatientMedicine } from '@/api/patient-medicines'

import { useCallback, useEffect } from 'react'
import { Alert, View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'

import { useMedicines, useMedicinesActions } from '@/api/medicines'
import {
	usePatientMedicine,
	usePatientMedicineActions,
	zPatientMedicine,
} from '@/api/patient-medicines'
import { BaseActions } from '@/components/base/actions'
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

export default function Screen() {
	const { id, mid } = useLocalSearchParams()
	const { data } = usePatientMedicine(Number(mid))

	const { data: medicines } = useMedicines()
	const { getByKey: getMedicineByKey, remove: removeMedicine } =
		useMedicinesActions()

	const form = useForm({
		resolver: zodResolver(zPatientMedicine),
		defaultValues: {
			patientId: Number(id),
			medicine: {
				name: '',
			},
		},
	})

	const { submit, remove } = usePatientMedicineActions()

	const onSubmit = useCallback(
		(data: TZPatientMedicine) => {
			const promise = submit(data.id, data)
			promise
				.then(() => router.back())
				.catch(error => {
					form.setError('root', {
						message: error.message,
					})
				})
		},
		[form, submit],
	)

	const onChangeMedicineId = useCallback(
		(key?: number) => {
			const medicine = getMedicineByKey(key)
			if (medicine) {
				form.setValue('medicine.name', medicine.name)
				form.setValue('medicine.thumbnail', medicine.thumbnail)
			}
		},
		[form, getMedicineByKey],
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
				onPress: () => {
					remove(data?.id)
					router.back()
				},
			},
		])
	}, [remove, data?.id])

	const onRemoveMedicine = useCallback(
		(id?: number) => {
			return (e?: any) => {
				removeMedicine(id, e)
			}
		},
		[removeMedicine],
	)

	useEffect(() => {
		if (data) {
			form.reset({
				...data,
			})
		}
	}, [form, data])

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
											image={item?.thumbnail?.uri}
										/>
										<Text className="text-lg flex-1" numberOfLines={1}>
											{item?.name}
										</Text>
										<Button
											icon="trash"
											size="xs"
											className="flex-none"
											variant="transparent"
											onPress={onRemoveMedicine(item?.id)}
										/>
									</View>
								)}
								getOptionValue={item => item?.id}
								onChange={onChangeMedicineId}
								trigger={v => (
									<Button
										{...v}
										icon="chevron-down"
										className="rounded-lg p-2 h-14 mt-7"
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
								icon: 'x',
								onPress: () => router.back(),
							},
							{
								icon: 'trash',
								hidden: !data?.id,
								onPress: onRemove,
							},
							{
								icon: 'check-circle',
								text: 'Submit',
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
