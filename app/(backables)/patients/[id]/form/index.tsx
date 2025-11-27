import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Text } from '@/components/ui/text'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { CheckCircleIcon, XIcon } from 'lucide-react-native'
import { Fragment, useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { z } from 'zod'

const zPatient = z.object({
	id: z.number().nullable(),
	dob: z.string().nullable(),
	name: z.string().min(1, 'Name is required!'),
	avatar: z.any(),
})

type TZPatient = z.infer<typeof zPatient>

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = api.patients.usePatientById(Number(id))

	const form = useForm({
		resolver: zodResolver(zPatient),
		defaultValues: {
			id: null,
			name: '',
			dob: null,
			avatar: null,
		},
	})

	const { submit } = api.patients.usePatientsActions()

	const onSubmit = useCallback(
		(data: TZPatient) => {
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

	if (id !== 'new' && !data) {
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
		<Fragment>
			<Stack.Screen
				options={{
					title: data ? `Update Patient` : `New Patient`,
				}}
			/>
			<KeyboardAvoidingScrollView>
				<FormProvider {...form}>
					<Form
						onSubmit={form.handleSubmit(onSubmit)}
						className="px-4 pt-4 pb-28 flex justify-end flex-1"
					>
						<View className="gap-4">
							<BaseImagePicker
								name="avatar"
								label="Avatar"
								control={form.control}
								options={{
									aspect: [1, 1],
									mediaTypes: 'images',
									allowsEditing: true,
								}}
							/>
							<BaseInput
								name="name"
								label="Name"
								placeholder="Write name here..."
								control={form.control}
								isRequired={true}
							/>
							<BaseDatePicker
								name="dob"
								display="spinner"
								initialValue={new Date('2000-01-01')}
								label="Date of Birth"
								placeholder="Select date of birth..."
								control={form.control}
							/>
						</View>
						<BaseActions
							className="bottom-8"
							data={[
								{
									icon: XIcon,
									onPress: () => router.back(),
								},
								{
									icon: CheckCircleIcon,
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
		</Fragment>
	)
}
