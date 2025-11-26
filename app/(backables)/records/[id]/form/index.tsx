import { api } from '@/api'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Button, ButtonText } from '@/components/ui/button'
import { Form, FormSubmit } from '@/components/ui/form'
import { Text } from '@/components/ui/text'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { z } from 'zod'

const zRecord = z.object({
	id: z.number().nullish(),
	type: z.string().min(1, 'Type is required!'),
	title: z.string().min(1, 'Title is required!'),
	description: z.string().nullish(),
	date: z.string().nullish(),
	doctor: z.string().nullish(),
	hospital: z.string().nullish(),
	location: z.string().nullish(),
	amount: z.number().nullish(),
	attachments: z.array(z.any()).nullish(),
})

type TZRecord = z.infer<typeof zRecord>

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = api.records.useRecordById(Number(id))

	const form = useForm({
		resolver: zodResolver(zRecord),
		defaultValues: {
			id: null,
			type: '',
			title: '',
			description: '',
			date: '',
			doctor: '',
			hospital: '',
			location: '',
			amount: 0,
			attachments: [],
		},
	})

	const { submit } = api.records.useRecordsActions()

	const onSubmit = useCallback(
		(data: TZRecord) => {
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
					title: data ? `Update Profile` : `New Profile`,
				}}
			/>
			<KeyboardAvoidingScrollView>
				<FormProvider {...form}>
					<Form
						className="px-8 py-16 flex flex-col gap-5 justify-end flex-1"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<BaseInput
							name="type"
							label="Type"
							placeholder="Enter type..."
							control={form.control}
							isRequired={true}
						/>
						<BaseInput
							name="title"
							label="Title"
							placeholder="Enter title..."
							control={form.control}
							isRequired={true}
						/>
						<BaseInput
							name="description"
							label="Description"
							placeholder="Enter description..."
							control={form.control}
						/>
						<BaseInput
							name="doctor"
							label="Doctor"
							placeholder="Doctor name..."
							control={form.control}
						/>
						<BaseInput
							name="hospital"
							label="Hospital"
							placeholder="Hospital name..."
							control={form.control}
						/>
						<BaseInput
							name="location"
							label="Location"
							placeholder="Location..."
							control={form.control}
						/>
						<BaseInput
							name="amount"
							label="Amount"
							keyboardType="numeric"
							placeholder="Amount..."
							control={form.control}
						/>
						<BaseDatePicker
							name="date"
							label="Date"
							placeholder="Select date..."
							control={form.control}
						/>
						<BaseImagePicker
							name="attachments"
							label="Attachments"
							control={form.control}
							options={{
								mediaTypes: 'images',
								allowsMultipleSelection: true,
							}}
						/>
						<FormSubmit>
							{props => (
								<Button {...props} size="xl">
									<ButtonText size="md">
										{data ? 'Update' : 'Submit'}
									</ButtonText>
								</Button>
							)}
						</FormSubmit>
						<Button variant="outline" size="xl" onPress={() => router.back()}>
							<ButtonText size="md">Cancel</ButtonText>
						</Button>
						{/* <BaseJson data={form.watch()} /> */}
					</Form>
				</FormProvider>
			</KeyboardAvoidingScrollView>
		</Fragment>
	)
}
