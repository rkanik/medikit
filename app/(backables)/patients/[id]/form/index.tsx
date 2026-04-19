import type { TZPatient } from '@/api/patients'

import { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { eq } from 'drizzle-orm'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'

import { usePatient, usePatientsActions, zPatient } from '@/api/patients'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Text } from '@/components/ui/text'
import { db } from '@/drizzle/db'
import { patientsTable } from '@/drizzle/schema'

const GENDER_OPTIONS = ['Male', 'Female']

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = usePatient(Number(id))

	const form = useForm({
		resolver: zodResolver(zPatient),
		defaultValues: {
			name: '',
		},
	})

	const gender = form.watch('gender')

	const { submit } = usePatientsActions()

	const onSubmit = useCallback(async (data: TZPatient) => {
		if (data.id) {
			const result = await db
				.update(patientsTable)
				.set({
					name: data.name,
					dob: data.dob,
					gender: data.gender,
					edd: data.edd,
				})
				.where(eq(patientsTable.id, data.id))
			console.log(result)
			return router.back()
		}
		const result = await db
			.insert(patientsTable)
			.values({
				name: data.name,
				dob: data.dob,
				gender: data.gender,
				edd: data.edd,
			})
			.returning()
		console.log(result)
		return router.back()
	}, [])

	useEffect(() => {
		if (data) {
			form.reset({
				...data,
			})
		}
	}, [form, data])

	if (id !== 'new' && !data) {
		return (
			<View className="flex-1 px-4">
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Text>Patient not found!</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingScrollView>
			<Stack.Screen
				options={{
					title: data ? `Update Patient` : `New Patient`,
				}}
			/>
			<FormProvider {...form}>
				<Form
					onSubmit={form.handleSubmit(onSubmit)}
					className="px-4 pt-4 pb-32 flex justify-end flex-1"
				>
					<View className="gap-4">
						<BaseImagePicker
							name="avatar"
							label="Avatar"
							control={form.control}
							aspect={[1, 1]}
							multiple={false}
						/>
						<BaseInput
							name="name"
							label="Name"
							placeholder="Write name here..."
							control={form.control}
							required={true}
							autoFocus={true}
						/>
						<BaseDatePicker
							name="dob"
							display="spinner"
							inputFormat="DD MMMM, YYYY"
							initialValue={new Date('2000-01-01')}
							label="Date of Birth"
							placeholder="Select date of birth..."
							control={form.control}
						/>
						<BaseSelect
							name="gender"
							label="Gender"
							control={form.control}
							options={GENDER_OPTIONS}
							getOptionLabel={item => item}
							getOptionValue={item => item}
						/>
						{gender === 'Female' && (
							<BaseDatePicker
								name="edd"
								display="spinner"
								inputFormat="DD MMMM, YYYY"
								label="Expected Delivery Date"
								control={form.control}
							/>
						)}
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
					</View>
				</Form>
			</FormProvider>
		</KeyboardAvoidingScrollView>
	)
}
