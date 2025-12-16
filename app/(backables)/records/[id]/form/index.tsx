import type { TZRecord } from '@/api/records'

import { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'

import { api } from '@/api'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Text } from '@/components/ui/text'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = api.records.useRecordById(Number(id))

	const form = useForm({
		resolver: zodResolver(api.records.zRecord),
		defaultValues: {
			id: null,
			type: '',
			text: '',
			amount: 0,
			date: new Date().toISOString(),
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
		if (data) form.reset(data)
	}, [form, data])

	if (id !== 'new' && !data) {
		return (
			<View className="flex-1 px-5">
				<Stack.Screen options={{ title: 'Not Found!' }} />
				<Text>Patient not found!</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingScrollView>
			<Stack.Screen
				options={{
					title: data ? `Update Record` : `New Record`,
				}}
			/>
			<FormProvider {...form}>
				<Form
					className="px-4 pt-4 pb-32 flex justify-end flex-1 gap-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<BaseImagePicker
						name="attachments"
						label="Attachments"
						control={form.control}
						scanner={true}
						multiple={true}
					/>
					<BaseInput
						name="text"
						label="Description"
						placeholder="Enter description..."
						control={form.control}
						required={true}
						multiline={true}
						numberOfLines={4}
					/>

					<BaseSelect
						name="type"
						label="Type"
						placeholder="Select type..."
						control={form.control}
						required={true}
						options={api.records.types}
					/>
					<BaseDatePicker
						name="date"
						label="Date"
						placeholder="Select date..."
						control={form.control}
						required={true}
					/>
					<BaseInput
						name="amount"
						label="Cost (TK)"
						keyboardType="numeric"
						placeholder="Cost..."
						control={form.control}
					/>
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
