import type { TBaseControllerProps } from '@/components/base/controller'
import type { ReactNode, Ref } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import type { TextInput } from 'react-native'
import type { VariantProps } from 'tailwind-variants'

import { forwardRef, useState } from 'react'
import { Keyboard, TouchableOpacity, View } from 'react-native'

import { cn } from 'tailwind-variants'

import { FlashList } from '@/components/FlashList'
import { Icon } from '@/components/ui/icon'
import { inputVariants } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'

import { BaseController } from '../controller'
import { BaseModal } from '../modal'

type TProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TOption = any,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> &
	VariantProps<typeof inputVariants> & {
		placeholder?: string
		options?: TOption[]
		getOptionLabel?: (option?: TOption) => any
		getOptionValue?: (option?: TOption) => any
	}

const ITEM_GAP = 8
const ITEM_HEIGHT = 64
const CONTAINER_PADDING = 16

const BaseSelectInner = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TOption = any,
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
		options = [],
		getOptionValue = v => v,
		getOptionLabel = v => v as ReactNode,
		...props
	}: TProps<TFieldValues, TName, TOption>,
	ref: Ref<TextInput>,
) => {
	const [visible, setVisible] = useState(false)
	return (
		<BaseController
			{...{ name, label, control, required, className }}
			render={v => {
				const option = options.find(o => getOptionValue(o) === v.field.value)
				return (
					<BaseModal
						visible={visible}
						setVisible={setVisible}
						height={
							(options.length || 0) * (ITEM_HEIGHT + ITEM_GAP) +
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
									{getOptionLabel(option) || props.placeholder}
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
							data={options}
							keyExtractor={getOptionValue}
							contentContainerStyle={{
								paddingHorizontal: CONTAINER_PADDING,
							}}
							renderItem={({ item }) => {
								const selected = getOptionValue(item) === v.field.value
								const label = getOptionLabel(item)
								return (
									<Pressable
										style={{ height: ITEM_HEIGHT, marginBottom: ITEM_GAP }}
										className={cn(
											'bg-white dark:bg-neutral-900 rounded-lg flex-row items-center px-4 overflow-hidden',
											{
												'border-2 border-green-500 dark:border-green-300':
													selected,
											},
										)}
										onPress={() => {
											v.field.onChange(getOptionValue(item))
											setVisible(false)
										}}
									>
										{typeof label === 'string' ? (
											<Text className="text-lg">{label}</Text>
										) : (
											label
										)}
									</Pressable>
								)
							}}
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
	TOption = any,
>(
	props: TProps<TFieldValues, TName, TOption> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseSelectInner<TFieldValues, TName, TOption>>
