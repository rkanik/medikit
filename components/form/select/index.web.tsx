import type { TFormSelect, TFormSelectProps } from '@/components/form/select'
import type { ClassNamesConfig, GroupBase } from 'react-select'
import {
	Fragment,
	useCallback,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react'
import { FlashList } from '@shopify/flash-list'
import Select from 'react-select'
import { cn } from 'tailwind-variants'
import { BaseButton } from '@/components/base/button'
import { BaseDialog } from '@/components/base/dialog'
import { Input } from '@/components/ui/input'
import { getDocument } from '@/utils/getDocument'
import { createFormItem } from '../item'

export const FormSelect = createFormItem<TFormSelectProps, TFormSelect>(
	function FormSelect({
		ref,
		field,
		hidden,
		options,
		multiple,
		fieldState,
		searchable,
		placeholder,
		menuPlacement,
		onChange,
		getOptionLabel,
		getOptionValue,
	}) {
		const [search, setSearch] = useState('')
		const [visible, setVisible] = useState(false)
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

		const findByValue = useCallback(
			(a: any) => {
				if (!a) return null
				return options?.find(b => {
					return (getOptionValue(a) || a) === getOptionValue(b)
				})
			},
			[options, getOptionValue],
		)

		const value = useMemo(() => {
			if (Array.isArray(field.value)) {
				return field.value.map(findByValue)
			}
			return findByValue(field.value) ?? null
		}, [field.value, findByValue])

		useImperativeHandle(
			ref,
			() => ({
				open() {
					if (hidden) {
						setVisible(true)
						return
					}
				},
			}),
			[hidden],
		)
		if (hidden)
			return (
				<Fragment>
					Open: {visible?.toString()}
					<BaseDialog open={visible} onOpenChange={setVisible}>
						<Input
							value={search}
							placeholder="Search..."
							onChangeText={setSearch}
						/>
						<FlashList
							data={filteredOptions}
							keyExtractor={item => String(getOptionValue(item))}
							keyboardShouldPersistTaps="always"
							contentContainerStyle={{ paddingRight: 2 }}
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
											setVisible(false)
										}}
									/>
								)
							}}
						/>
					</BaseDialog>
				</Fragment>
			)
		return (
			<Select
				value={value}
				options={options}
				isMulti={multiple}
				placeholder={placeholder}
				hideSelectedOptions={multiple}
				menuPortalTarget={getDocument()?.body}
				closeMenuOnSelect={!multiple}
				getOptionValue={getOptionValue}
				getOptionLabel={getOptionLabel as any}
				isSearchable={searchable}
				menuPlacement={menuPlacement}
				classNames={classNames({
					error: fieldState.error,
				})}
				onChange={v => {
					if (!v) return
					if (!Array.isArray(v)) {
						const value = getOptionValue(v)
						onChange?.(value)
						field.onChange(value)
						return
					}
					const values = v.map(v => getOptionValue(v))
					onChange?.(values)
					field.onChange(values)
					return
				}}
			/>
		)
	},
) as TFormSelect

const classNames = ({
	error,
}: {
	error?: any
}): ClassNamesConfig<any, boolean, GroupBase<any>> => ({
	menu: () => `!z-[9999] text-base min-w-max`,
	menuList: () => ``,
	menuPortal: () => '!z-[9999] !fixed !pointer-events-auto',
	singleValue: () => `text-base`,
	multiValue: () => {
		return cn(`bg-primary rounded`) as string
	},
	multiValueLabel: () => {
		return cn(`text-white text-base p-[3px] leading-none`) as string
	},
	multiValueRemove() {
		return cn(
			`bg-black bg-opacity-10 w-5 rounded rounded-l-none ml-px`,
		) as string
	},
	indicatorsContainer: () => {
		return cn(``) as string
	},
	option: v => {
		return cn('py-1.5', {
			'!bg-primary !bg-opacity-20': v.isFocused && !v.isSelected,
			'!bg-primary !text-white': v.isSelected,
		}) as string
	},
	control: v => {
		return cn({
			'!bg-transparent !rounded-md !min-h-11 _shadow-none': true,
			'!border-red-500': error,
			'!border-primary': v.isFocused && !error,
			'!border-gray-500': !v.isFocused && !error,
		}) as string
	},
	valueContainer() {
		return cn('!px-2') as string
	},
	indicatorSeparator() {
		return cn(`!hidden`) as string
	},
	clearIndicator() {
		return cn(`!hidden`) as string
	},
	placeholder() {
		return cn(`text-[#585C5F] text-base`) as string
	},
})
