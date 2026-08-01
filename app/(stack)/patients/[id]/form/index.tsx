import type { TZPatient } from '@/api/patients'
import { useCallback, useEffect } from 'react'
import { Switch, View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { zPatient } from '@/api/patients'
import { BaseActions } from '@/components/base/actions'
import { BaseController } from '@/components/base/controller'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Text } from '@/components/ui/text'
import { usePatientsMutation } from '@/mutations/usePatientsMutation'
import { usePatientByIdQuery } from '@/queries/usePatientByIdQuery'
import { useInvalidatePatientPregnanciesQuery } from '@/queries/usePatientPregnanciesQuery'
import { useInvalidatePatientsQuery } from '@/queries/usePatientsQuery'

const GENDER_OPTIONS = ['Male', 'Female']

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = usePatientByIdQuery(Number(id))
	const { mutate } = usePatientsMutation()
	const invalidatePatientsQuery = useInvalidatePatientsQuery()
	const invalidatePregnancies = useInvalidatePatientPregnanciesQuery()

	const form = useForm({
		resolver: zodResolver(zPatient),
		defaultValues: {
			name: '',
			public: true,
		},
	})

	const onSubmit = useCallback(
		(data: TZPatient) => {
			mutate(data, {
				onSuccess() {
					invalidatePatientsQuery()
					invalidatePregnancies()
					router.back()
				},
				onError(error) {
					form.setError('root', {
						message: error.message,
					})
				},
			})
		},
		[form, mutate, invalidatePatientsQuery, invalidatePregnancies],
	)

	useEffect(() => {
		if (data) {
			form.reset({
				...data,
				public: data.public ?? true,
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
						<BaseDatePicker
							name="dod"
							display="spinner"
							inputFormat="DD MMMM, YYYY"
							label="Date of Death"
							placeholder="Select date of death..."
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
						<BaseController
							name="public"
							label="Public"
							control={form.control}
							render={({ field }) => (
								<View className="flex-row items-center justify-between rounded-xl bg-white dark:bg-neutral-800 px-4 py-3">
									<Text className="flex-1 text-base pr-3">
										Show in patient list and record picker
									</Text>
									<Switch
										value={field.value !== false}
										onValueChange={field.onChange}
									/>
								</View>
							)}
						/>
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
									prependIcon: 'check-circle',
									title: 'Submit',
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
