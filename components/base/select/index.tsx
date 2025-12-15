import { Text } from '@/components/ui/text'
import type { Ref } from 'react'
import { forwardRef, useState } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

import { FlashList } from '@/components/FlashList'
import { Icon } from '@/components/ui/icon'
import { inputVariants } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { cn, VariantProps } from 'tailwind-variants'
import { BaseModal } from '../modal'

type TProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> &
	VariantProps<typeof inputVariants> & {
		placeholder?: string
		options?: {
			label: string
			value: string
		}[]
	}

const ITEM_GAP = 8
const ITEM_HEIGHT = 64
const CONTAINER_PADDING = 16

const BaseSelectInner = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	{
		name,
		label,
		control,
		required,
		className,
		size,
		focus,
		variant,
		...props
	}: TProps<TFieldValues, TName>,
	ref: Ref<TextInput>,
) => {
	const [visible, setVisible] = useState(false)
	return (
		<BaseController
			{...{ name, label, control, required, className }}
			render={v => {
				const option = props.options?.find(o => o.value === v.field.value)
				return (
					<BaseModal
						visible={visible}
						setVisible={setVisible}
						height={
							(props.options?.length || 0) * (ITEM_HEIGHT + ITEM_GAP) +
							CONTAINER_PADDING +
							40
						}
						trigger={trigger => (
							<Pressable
								className={inputVariants({
									size,
									variant,
									focus: false,
									error: !!v.fieldState.error,
								})}
								onPress={() => {
									trigger.onPress()
									Keyboard.dismiss()
								}}
							>
								<Text
									className={cn('text-lg', {
										'text-neutral-500 dark:text-neutral-400': !v.field.value,
									})}
								>
									{option?.label || props.placeholder}
								</Text>
								<View className="flex-none flex-row items-center gap-2">
									{v.field.value ? (
										<TouchableOpacity onPress={() => v.field.onChange(null)}>
											<Icon
												name="x"
												className="text-lg text-neutral-500 dark:text-neutral-400"
											/>
										</TouchableOpacity>
									) : (
										<Icon
											name="chevron-down"
											className="text-xl text-neutral-500 dark:text-neutral-400"
										/>
									)}
								</View>
							</Pressable>
						)}
					>
						<FlashList
							data={props.options}
							keyExtractor={item => item.value}
							contentContainerStyle={{
								paddingHorizontal: CONTAINER_PADDING,
							}}
							renderItem={({ item }) => (
								<Pressable
									style={{ height: ITEM_HEIGHT, marginBottom: ITEM_GAP }}
									className={cn(
										'bg-white dark:bg-neutral-900 rounded-lg flex-row items-center px-4 overflow-hidden',
										{
											'border-2 border-green-500 dark:border-green-300':
												item.value === v.field.value,
										},
									)}
									onPress={() => {
										v.field.onChange(item.value)
										setVisible(false)
									}}
								>
									<Text className="text-lg">{item.label}</Text>
								</Pressable>
							)}
						/>
					</BaseModal>
				)
			}}
		/>
	)
}

export const BaseSelect = forwardRef(BaseSelectInner) as <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TProps<TFieldValues, TName> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseSelectInner<TFieldValues, TName>>
