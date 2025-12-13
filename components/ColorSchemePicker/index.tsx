import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { TColorScheme } from '@/types'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { cn } from 'tailwind-variants'
import { BaseModal, TBaseModalProps } from '../base/modal'
import { IconCard } from '../IconCard'

const COLOR_SCHEMES = [
	{
		value: 'light' as TColorScheme,
		label: 'Light Mode',
		icon: 'sun',
		iconClassName: 'text-yellow-500',
	},
	{
		value: 'dark' as TColorScheme,
		label: 'Dark Mode',
		icon: 'moon',
		iconClassName: 'text-blue-500',
	},
	{
		value: 'system' as TColorScheme,
		label: 'System Mode',
		icon: 'palette',
		iconClassName: 'text-green-500',
	},
]

type TColorSchemePickerProps = {
	trigger?: TBaseModalProps['trigger']
}

export const ColorSchemePicker = ({ trigger }: TColorSchemePickerProps) => {
	const [visible, setVisible] = useState(false)
	const { colorScheme, setColorScheme } = useColorSchemeStorage()

	const onPress = useCallback(
		(value: TColorScheme) => {
			setVisible(false)
			setColorScheme(value)
		},
		[setColorScheme],
	)

	return (
		<BaseModal
			height={400}
			trigger={trigger}
			visible={visible}
			scrollable={false}
			setVisible={setVisible}
		>
			<View className="px-4 gap-4 pt-4">
				{COLOR_SCHEMES.map(v => (
					<IconCard
						key={v.value}
						icon={v.icon}
						title={v.label}
						iconSize="4xl"
						iconClassName={v.iconClassName}
						onPress={() => onPress(v.value)}
						className={cn({
							'border dark:border-green-500': colorScheme === v.value,
						})}
					/>
				))}
			</View>
		</BaseModal>
	)
}
