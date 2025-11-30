import { api } from '@/api'
import { TZRecord } from '@/api/records'
import { BaseActions } from '@/components/base/actions'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { CheckCircleIcon, XIcon } from 'lucide-react-native'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { View } from 'react-native'

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
					className="px-4 pt-4 pb-32 flex justify-end flex-1"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<Grid className="gap-4" _extra={{ className: 'grid-cols-2' }}>
						<GridItem _extra={{ className: 'col-span-2' }}>
							<BaseImagePicker
								name="attachments"
								label="Attachments"
								control={form.control}
								scanner={true}
								multiple={true}
							/>
						</GridItem>
						<GridItem _extra={{ className: 'col-span-2' }}>
							<BaseInput
								name="text"
								label="Description"
								placeholder="Enter description..."
								control={form.control}
								isRequired={true}
								autoFocus={true}
							/>
						</GridItem>
						<GridItem _extra={{ className: 'col-span-2' }}>
							<BaseSelect
								name="type"
								label="Type"
								placeholder="Select type..."
								control={form.control}
								isRequired={true}
								options={api.records.types}
							/>
						</GridItem>
						<GridItem _extra={{ className: 'col-span-1' }}>
							<BaseDatePicker
								name="date"
								label="Date"
								placeholder="Select date..."
								control={form.control}
								isRequired={true}
							/>
						</GridItem>
						<GridItem _extra={{ className: 'col-span-1' }}>
							<BaseInput
								name="amount"
								label="Cost (TK)"
								keyboardType="numeric"
								placeholder="Cost..."
								control={form.control}
							/>
						</GridItem>
						<GridItem _extra={{ className: 'col-span-2' }}>
							<BaseActions
								className="relative justify-end px-0"
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
						</GridItem>
					</Grid>
				</Form>
			</FormProvider>
		</KeyboardAvoidingScrollView>
	)
}
