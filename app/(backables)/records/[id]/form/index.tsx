import { api } from '@/api'
import { TZRecord } from '@/api/records'
import { BaseDatePicker } from '@/components/base/DatePicker'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseSelect } from '@/components/base/select'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Button, ButtonText } from '@/components/ui/button'
import { Form, FormSubmit } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback, useEffect } from 'react'
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
					title: data ? `Update Record` : `New Record`,
				}}
			/>
			<KeyboardAvoidingScrollView>
				<FormProvider {...form}>
					<Form
						className="px-8 py-16 flex flex-col justify-end flex-1"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<Grid className="gap-4" _extra={{ className: 'grid-cols-2' }}>
							<GridItem _extra={{ className: 'col-span-2' }}>
								<BaseImagePicker
									name="attachments"
									label="Attachments"
									control={form.control}
									options={{
										mediaTypes: 'images',
										allowsMultipleSelection: true,
									}}
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
							<GridItem _extra={{ className: 'col-span-2' }}>
								<BaseInput
									name="text"
									label="Description"
									placeholder="Enter description..."
									control={form.control}
									isRequired={true}
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
								<FormSubmit>
									{props => (
										<Button {...props} size="xl">
											<ButtonText size="md">
												{data ? 'Update' : 'Submit'}
											</ButtonText>
										</Button>
									)}
								</FormSubmit>
							</GridItem>
							<GridItem _extra={{ className: 'col-span-2' }}>
								<Button
									variant="outline"
									size="xl"
									onPress={() => router.back()}
								>
									<ButtonText size="md">Cancel</ButtonText>
								</Button>
							</GridItem>
						</Grid>
						{/* <BaseJson data={form.watch()} /> */}
					</Form>
				</FormProvider>
			</KeyboardAvoidingScrollView>
		</Fragment>
	)
}
