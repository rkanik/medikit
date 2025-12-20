import type { TZRecord } from '@/api/records'

import { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'

import { useCurrentPatientIdStorage, usePatients } from '@/api/patients'
import { useRecordById, useRecordsActions, zRecord } from '@/api/records'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { BaseTagInput } from '@/components/base/TagInput'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'
import { useTags } from '@/hooks/useTags'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = useRecordById(Number(id))
	const { data: tags } = useTags()
	const { data: patients } = usePatients()
	const [currentPatientId] = useCurrentPatientIdStorage()

	const form = useForm({
		resolver: zodResolver(zRecord),
		defaultValues: {
			id: null,
			text: '',
			amount: 0,
			patientId: currentPatientId,
			date: new Date().toISOString(),
			attachments: [],
		},
	})

	const { submit } = useRecordsActions()

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
				<Text>Record not found!</Text>
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
					<Grid cols={2} gap={16}>
						<GridItem colSpan={2}>
							<BaseImagePicker
								name="attachments"
								label="Attachments"
								control={form.control}
								scanner={true}
								multiple={true}
							/>
						</GridItem>
						<GridItem colSpan={2}>
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
						</GridItem>
						<GridItem>
							<BaseDatePicker
								name="date"
								label="Date"
								display="spinner"
								placeholder="Select date..."
								inputFormat="DD MMM, YYYY"
								control={form.control}
								required={true}
							/>
						</GridItem>
						<GridItem>
							<BaseInput
								name="amount"
								label="Cost (TK)"
								keyboardType="numeric"
								placeholder="Cost..."
								control={form.control}
							/>
						</GridItem>
						<GridItem colSpan={2}>
							<BaseTagInput
								name="tags"
								label="Tags"
								tags={tags}
								control={form.control}
								placeholder="Enter record tags..."
							/>
						</GridItem>
						<GridItem colSpan={2}>
							<BaseInput
								name="text"
								label="Description"
								placeholder="Enter description..."
								control={form.control}
								multiline={true}
								numberOfLines={4}
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
