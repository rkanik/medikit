import type { TZPatientMedicine } from '@/api/patient-medicines'

import { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'

import { useMedicines } from '@/api/medicines'
import {
	usePatientMedicine,
	usePatientMedicineActions,
	zPatientMedicine,
} from '@/api/patient-medicines'
import { usePatients } from '@/api/patients'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'

export default function Screen() {
	const { id, mid } = useLocalSearchParams()
	const { data } = usePatientMedicine(Number(mid))

	const { data: patients } = usePatients()
	const { data: medicines } = useMedicines()

	const form = useForm({
		resolver: zodResolver(zPatientMedicine),
		defaultValues: {
			id: null,
			patientId: Number(id),
			medicineId: Number(mid),
			startDate: null,
			endDate: null,
		},
	})

	const { submit } = usePatientMedicineActions()

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
					<Grid cols={2} gap={16}>
						{/* <GridItem colSpan={2}>
							<BaseSelect
								name="patientId"
								label="Patient"
								placeholder="Select patient..."
								control={form.control}
								required={true}
								options={patients}
								getOptionLabel={item => item?.name}
								getOptionValue={item => item?.id}
							/>
						</GridItem> */}
						<GridItem colSpan={2}>
							<View className="flex-row items-end gap-2 ">
								<BaseSelect
									name="medicineId"
									label="Medicine"
									className="flex-1"
									control={form.control}
									required={true}
									options={medicines}
									getOptionLabel={item => item?.name}
									getOptionValue={item => item?.id}
								/>
								<Button
									icon="plus"
									className="rounded-lg p-2 h-14"
									onPress={() => router.push(`/medicines/new/form`)}
								/>
							</View>
						</GridItem>
						<GridItem>
							<BaseDatePicker
								name="startDate"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								initialValue={new Date()}
								minimumDate={new Date()}
								label="Start Date"
								control={form.control}
							/>
						</GridItem>
						<GridItem>
							<BaseDatePicker
								name="endDate"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								initialValue={new Date()}
								minimumDate={new Date()}
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
