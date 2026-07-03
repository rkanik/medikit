import type { TFormItemProps } from '@/components/form/item'
import type { TPrettify } from '@/types'
import type { ComponentProps } from 'react'
import type { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form'
import type { MenuPlacement } from 'react-select'
import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react'
import { Keyboard, View } from 'react-native'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { BaseButton } from '@/components/base/button'
import { BaseDialog } from '@/components/base/dialog'
import { Input } from '@/components/ui/input'
import { createFormItem } from '../item'
import { FormItemTrigger } from '../item/trigger'

export type TFormSelectRef = {
	open: () => void
}

export type TFormSelect = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
	TOption extends object = FieldPathValue<TFieldValues, TName>,
	TMultiple extends boolean = boolean,
>(
	props: TPrettify<
		TFormItemProps<TFieldValues, TName> & {
			ref?: React.Ref<TFormSelectRef>
			hidden?: boolean
			placeholder?: string
			options?: TOption[]
			multiple?: TMultiple
			searchable?: boolean
			menuPlacement?: MenuPlacement
			onChange?: (value: FieldPathValue<TFieldValues, TName>) => void
			getOptionLabel: (option: TOption) => React.ReactNode
			getOptionValue: (option: TOption) => FieldPathValue<TFieldValues, TName>
		}
	>,
) => React.ReactElement

export type TFormSelectProps = ComponentProps<TFormSelect>

const ITEM_GAP = 8
const ITEM_HEIGHT = 64
const CONTAINER_PADDING = 16

export const FormSelect = createFormItem<TFormSelectProps, TFormSelect>(
	function FormSelect({
		ref,
		field,
		hidden,
		options,
		searchable = (options?.length || 0) > 15,
		onChange,
		getOptionLabel,
		getOptionValue,
	}) {
		const [visible, setVisible] = useState(false)
		const [search, setSearch] = useState('')
		const filteredOptions = useMemo(() => {
			return options?.filter(opt => {
				return Object.values(opt).some(v => {
					if (['string', 'number'].includes(typeof v)) {
						return `${v}`.toLowerCase().includes(search.toLowerCase())
					}
					return false
				})
			})
		}, [options, search])

		// Find the selected option
		const selectedOption = useMemo(() => {
			return options?.find(opt => {
				return getOptionValue(opt) === field.value
			})
		}, [options, field.value, getOptionValue])

		// Callback for setting the visible state of the modal
		const onSetVisible = useCallback((visible: boolean) => {
			setVisible(visible)
			if (!visible) {
				setSearch('')
				Keyboard.dismiss()
			}
		}, [])

		// Imperative handle for opening the modal
		useImperativeHandle(
			ref,
			() => ({
				open() {
					Keyboard.dismiss()
					setVisible(true)
				},
			}),
			[],
		)

		const computedHeight = useMemo(() => {
			return Math.min(
				(options?.length || 0) * (ITEM_HEIGHT + ITEM_GAP) +
					CONTAINER_PADDING +
					(searchable ? 64 : 0) +
					40,
				500,
			)
		}, [options, searchable])

		const [height, setHeight] = useState(computedHeight)

		useEffect(() => {
			setHeight(computedHeight)
		}, [computedHeight])

		//
		return (
			<View>
				{!hidden && (
					<FormItemTrigger
						variant="secondary"
						onPress={() => setVisible(true)}
						title={selectedOption ? getOptionLabel(selectedOption) : ''}
					/>
				)}
				<BaseDialog
					open={visible}
					height={height}
					heightOnKeyboard={'90%'}
					scrollable={false}
					onOpenChange={onSetVisible}
					bodyProps={{ className: 'px-0 pt-0 pb-8' }}
				>
					<View className="flex-1">
						{searchable && (
							<View className="mb-4 px-5">
								<Input
									value={search}
									placeholder="Search..."
									onChangeText={setSearch}
									onFocus={() => {
										setHeight(Math.min(400 + computedHeight, 700))
									}}
									onBlur={() => {
										setHeight(computedHeight)
									}}
								/>
							</View>
						)}
						<BottomSheetFlatList
							data={filteredOptions}
							keyExtractor={(item: any) => String(getOptionValue(item))}
							keyboardShouldPersistTaps="always"
							contentContainerStyle={{
								paddingHorizontal: CONTAINER_PADDING,
							}}
							getItemLayout={(_: any, index: number) => ({
								length: ITEM_HEIGHT + ITEM_GAP,
								offset: (ITEM_HEIGHT + ITEM_GAP) * index,
								index,
							})}
							renderItem={({ item }: { item: any }) => {
								const label = getOptionLabel(item)
								const selected = getOptionValue(item) === field.value
								return (
									<BaseButton
										title={label}
										size="xl"
										variant={selected ? 'default' : 'secondary'}
										className="mb-2 justify-start"
										onPress={() => {
											const v = getOptionValue(item)
											field.onChange(v)
											onChange?.(v)
											onSetVisible(false)
										}}
									/>
								)
							}}
						/>
					</View>
				</BaseDialog>
			</View>
		)
	},
)
