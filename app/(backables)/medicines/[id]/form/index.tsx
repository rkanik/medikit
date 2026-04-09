import type { TZMedicine } from '@/api/medicines'

import { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'

import { useMedicine, useMedicinesActions, zMedicine } from '@/api/medicines'
import { BaseActions } from '@/components/base/actions'
import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView'
import { Form } from '@/components/ui/form'
import { Grid, GridItem } from '@/components/ui/grid'
import { Text } from '@/components/ui/text'

export default function Screen() {
	const { id } = useLocalSearchParams()
	const { data } = useMedicine(Number(id))

	const form = useForm({
		resolver: zodResolver(zMedicine),
		defaultValues: {
			id: null,
			name: '',
			thumbnail: null,
		},
	})

	const { submit } = useMedicinesActions()

	const onSubmit = useCallback(
		(data: TZMedicine) => {
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
						<GridItem colSpan={2}>
							<BaseImagePicker
								name="thumbnail"
								label="Thumbnail"
								control={form.control}
								aspect={[1, 1]}
								multiple={false}
							/>
						</GridItem>
						<GridItem colSpan={2}>
							<BaseInput
								name="name"
								label="Name"
								control={form.control}
								required={true}
								autoFocus={true}
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
