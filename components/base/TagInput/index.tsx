import type { TBaseControllerProps } from '@/components/base/controller'
import type { Ref } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { forwardRef, useMemo, useRef, useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import { cn } from 'tailwind-variants'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useCurrentForm } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { type TInputProps } from '@/components/ui/input'
import { Text, Title } from '@/components/ui/text'
import { useSchemeColors } from '@/hooks/useSchemeColors'
import { useTagsMutation } from '@/mutations/useTagsMutation'
import { useTagsQuery } from '@/queries/useTagsQuery'
import { BaseController } from '../controller'
import { BaseJson } from '../Json'
import { BaseModal } from '../modal'

export type TBaseTagInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TBaseControllerProps<TFieldValues, TName>, 'render'> &
	TInputProps & {
		tags?: string[]
	}

const BaseTagInputInner = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	{
		name,
		label,
		control,
		required,
		className,
		keyboardType,
		tags = [],
		placeholder = 'Enter tags...',
		onBlur,
		onFocus,
		...props
	}: TBaseTagInputProps<TFieldValues, TName>,
	ref: Ref<TextInput>,
) => {
	const form = useCurrentForm()
	const countRef = useRef(0)

	const [value, setValue] = useState('')

	const { data } = useTagsQuery()
	const { mutate } = useTagsMutation()

	const { textColorSecondary } = useSchemeColors()

	const groupedTags = useMemo(() => {
		const grouped = tags.reduce(
			(acc, tag) => {
				const firstLetter = tag[0].toUpperCase()
				if (!acc[firstLetter]) {
					acc[firstLetter] = []
				}
				acc[firstLetter].push(tag)
				return acc
			},
			{} as Record<string, string[]>,
		)
		return Object.entries(grouped)
			.map(([name, children]) => ({
				name,
				children,
			}))
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [tags])

	return (
		<BaseController
			{...{ name, label, control, required, className }}
			render={({ field }) => {
				const items: string[] = Array.isArray(field.value) ? field.value : []
				return (
					<View>
						<View
							className={cn(
								'flex-row justify-between items-center gap-4 bg-white dark:bg-neutral-800 min-h-14 rounded-lg',
								{
									'px-4 py-3.5': !items.length,
									'px-3 p-3': items.length > 0,
								},
							)}
						>
							<View className="flex-1 flex-row flex-wrap gap-1">
								{items.map((item, index) => (
									<Badge
										key={index}
										text={item}
										onPressRemove={() =>
											field.onChange(items.filter(i => i !== item))
										}
									/>
								))}
								<TextInput
									value={value}
									keyboardType="default"
									returnKeyType="next"
									returnKeyLabel="Add"
									submitBehavior="submit"
									placeholder={placeholder}
									placeholderTextColor={textColorSecondary}
									className="text-black dark:text-white py-0 text-lg px-0 leading-snug flex-1 min-w-16 overflow-hidden"
									onChangeText={setValue}
									onSubmitEditing={e => {
										const name = e.nativeEvent.text.trim()
										if (!name.length) return

										console.log('mutate', { name })
										mutate(
											{ name },
											{
												onSuccess: e => {
													console.log('onSuccess', e)
													// field.onChange([...items, text])
													// setValue('')
													// countRef.current = 0
												},
											},
										)

										// field.onChange([...items, e.nativeEvent.text.trim()])
										// setValue('')
										// countRef.current = 0
									}}
									onFocus={e => {
										onFocus?.(e)
										form?.onFocus(e)
									}}
									onBlur={e => {
										onBlur?.(e)
										field.onBlur()
									}}
									onKeyPress={e => {
										if (e.nativeEvent.key === 'Backspace') {
											if (!value?.trim().length && countRef.current > 1) {
												field.onChange(items.slice(0, -1))
												countRef.current = 0
											}
											countRef.current++
										} else {
											countRef.current = 0
										}
									}}
								/>
							</View>
							<View className="flex-none flex-row items-center gap-2">
								{items.length > 0 && (
									<TouchableOpacity onPress={() => field.onChange([])}>
										<Icon
											name="x"
											className="text-lg text-neutral-500 dark:text-neutral-400"
										/>
									</TouchableOpacity>
								)}
							</View>
						</View>
						<BaseJson data={data} />
						{!!tags.length && (
							<BaseModal
								trigger={v => (
									<TouchableOpacity {...v} className="mt-1 ml-1 ">
										<Text className="text-neutral-500 dark:text-neutral-500 text-sm underline">
											Select tags
										</Text>
									</TouchableOpacity>
								)}
							>
								<View className="px-4 pb-8">
									<Title className="mb-4">Select Tags</Title>
									{groupedTags.map(v => (
										<View key={v.name} className="flex-row gap-2 mb-2">
											<Avatar
												text={v.name}
												textClassName="text-neutral-500 dark:text-neutral-300 text-sm font-normal"
												className="w-8 h-8 bg-neutral-100 dark:bg-neutral-900"
											/>
											<View className="flex-row flex-wrap gap-2">
												{v.children.map(tag => {
													const selected = items.includes(tag)
													return (
														<Badge
															key={tag}
															text={tag}
															selected={selected}
															className="px-4 py-2 rounded-lg"
															onPress={() => {
																if (selected) {
																	field.onChange(items.filter(i => i !== tag))
																} else {
																	field.onChange([...items, tag])
																}
															}}
														/>
													)
												})}
											</View>
										</View>
									))}
								</View>
							</BaseModal>
						)}
					</View>
				)
			}}
		/>
	)
}

export const BaseTagInput = forwardRef(BaseTagInputInner) as <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
	props: TBaseTagInputProps<TFieldValues, TName> & { ref?: Ref<TextInput> },
) => ReturnType<typeof BaseTagInputInner<TFieldValues, TName>>
