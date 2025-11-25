import { BaseImagePicker } from '@/components/base/ImagePicker'
import { BaseInput } from '@/components/base/input'
import { BaseJson } from '@/components/base/Json'
import { Button, ButtonText } from '@/components/ui/button'
import { Form, FormSubmit } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Fragment, useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { z } from 'zod'

const zPatient = z.object({
	name: z.string().min(1, 'Name is required!'),
	avatar: z.any(),
})

type TZPatient = z.infer<typeof zPatient>

export default function Screen() {
	const { id } = useLocalSearchParams()

	const form = useForm({
		resolver: zodResolver(zPatient),
		defaultValues: {
			name: '',
			avatar: null,
		},
	})

	const onSubmit = useCallback((data: TZPatient) => {
		console.log(data)
	}, [])

	return (
		<Fragment>
			<Stack.Screen
				options={{
					title: `Add Patient ${id}`,
				}}
			/>
			<View className="px-5 flex-1">
				<FormProvider {...form}>
					<Form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4 flex-1"
					>
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
							placeholder="Enter name"
							control={form.control}
							isRequired={true}
						/>
						<FormSubmit>
							{props => (
								<Button {...props} size="xl">
									<ButtonText size="md">Add Patient</ButtonText>
								</Button>
							)}
						</FormSubmit>

						<BaseJson data={form.watch()} />
					</Form>
				</FormProvider>
			</View>
		</Fragment>
	)
}
