import { Text } from '@/components/ui/text'
import type { Ref } from 'react'
import { forwardRef, Fragment, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import {
	Keyboard,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { BaseController, TBaseControllerProps } from '../controller'

import { FlashList } from '@/components/FlashList'
import { Icon } from '@/components/ui/icon'
import { cn } from 'tailwind-variants'
import { BaseModal } from '../modal'

type TProps<T extends FieldValues> = TBaseControllerProps<T> & {
	placeholder?: string
	options?: {
		label: string
		value: string
	}[]
}

const ITEM_GAP = 8
const ITEM_HEIGHT = 48
const CONTAINER_PADDING = 20

const BaseSelectInner = <T extends FieldValues>(
	{ size = 'lg', ...props }: TProps<T>,
	ref: Ref<TextInput>,
) => {
	const [visible, setVisible] = useState(false)
	return (
		<Fragment>
			<BaseController
				{...props}
				size={size}
				render={v => {
					const option = props.options?.find(o => o.value === v.field.value)
					return (
						<BaseModal
							visible={visible}
							height={
								(props.options?.length || 0) * (ITEM_HEIGHT + ITEM_GAP) +
								CONTAINER_PADDING +
								40
							}
							setVisible={setVisible}
							trigger={trigger => (
								<TouchableOpacity
									{...trigger}
									className={cn(
										'border border-background-300 rounded p-2 h-12 flex-row items-center justify-between',
										{
											'border-red-500': !!v.fieldState.error,
										},
									)}
									onPress={() => {
										Keyboard.dismiss()
									}}
								>
									<Text
										className={cn('text-typography-900 text-lg', {
											'text-typography-500': !v.field.value,
										})}
									>
										{option?.label || props.placeholder}
									</Text>
									<View className="flex-none flex-row items-center gap-2">
										{v.field.value && (
											<Pressable onPress={() => v.field.onChange(null)}>
												<Icon
													name="x"
													size="lg"
													className="text-background-300"
												/>
											</Pressable>
										)}
										<Icon
											name="chevron-down"
											size="lg"
											className="text-background-300"
										/>
									</View>
								</TouchableOpacity>
							)}
						>
							<FlashList
								data={props.options}
								keyExtractor={item => item.value}
								contentContainerStyle={{ paddingHorizontal: CONTAINER_PADDING }}
								renderItem={({ item }) => (
									<Pressable
										style={{ height: ITEM_HEIGHT, marginBottom: ITEM_GAP }}
										className="dark:bg-neutral-900 rounded-lg flex-row items-center px-4"
										onPress={() => {
											v.field.onChange(item.value)
											setVisible(false)
										}}
									>
										<Text>{item.label}</Text>
									</Pressable>
								)}
							/>
						</BaseModal>
					)
				}}
			/>
		</Fragment>
	)
}

export const BaseSelect = forwardRef(BaseSelectInner) as <
	T extends FieldValues,
>(
	props: TProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseSelectInner>
