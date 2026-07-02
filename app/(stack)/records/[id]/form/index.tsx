import type { TZRecord } from '@/mutations/useRecordsMutation'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { useCurrentPatientIdStorage } from '@/api/patients'
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
import { useApp } from '@/context/AppContext'
import {
	useRecordsMutation,
	zRecord,
} from '@/mutations/useRecordsMutation'
import { usePatientsListQuery } from '@/queries/usePatientsListQuery'
import {
	getRecordTagIds,
	useRecordByIdQuery,
} from '@/queries/useRecordByIdQuery'
import { useInvalidateRecordsQuery } from '@/queries/useRecordsQuery'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { pendingRecordAttachments, setPendingRecordAttachments } = useApp()
	const { data } = useRecordByIdQuery(Number(id))
	const { data: patients } = usePatientsListQuery()
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
			tags: [],
		},
	})

	const { mutate } = useRecordsMutation()
	const invalidateRecordsQuery = useInvalidateRecordsQuery()

	const onSubmit = useCallback(
		(data: TZRecord) => {
			mutate(data, {
				onSuccess() {
					invalidateRecordsQuery()
					router.back()
				},
				onError(error) {
					form.setError('root', {
						message: error.message,
					})
				},
			})
		},
		[form, mutate, invalidateRecordsQuery],
	)

	useEffect(() => {
		if (data) {
			form.reset({
				id: data.id,
				text: data.text ?? '',
				amount: data.amount,
				patientId: data.patientId ?? currentPatientId ?? 0,
				date: data.date,
				tags: getRecordTagIds(data),
				attachments: data.attachments ?? [],
			})
		}
	}, [form, data, currentPatientId])

	useEffect(() => {
		if (id !== 'new' || !pendingRecordAttachments?.length) return
		form.setValue('attachments', pendingRecordAttachments)
		setPendingRecordAttachments(null)
	}, [
		form,
		id,
		pendingRecordAttachments,
		setPendingRecordAttachments,
	])

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
				</Form>
			</FormProvider>
		</KeyboardAvoidingScrollView>
	)
}
