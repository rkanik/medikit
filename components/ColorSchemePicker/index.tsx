import { useColorSchemeStorage } from '@/hooks/useColorSchemeStorage'
import { TColorScheme } from '@/types'
import { cn } from '@/utils/cn'
import { MoonIcon, PaletteIcon, SunIcon } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { BaseDialog, TBaseDialogTrigger } from '../base/BaseDialog'
import { IconCard } from '../IconCard'

const COLOR_SCHEMES = [
	{
		value: 'light' as TColorScheme,
		label: 'Light Mode',
		icon: SunIcon,
		iconClassName: 'text-yellow-500',
	},
	{
		value: 'dark' as TColorScheme,
		label: 'Dark Mode',
		icon: MoonIcon,
		iconClassName: 'text-blue-500',
	},
	{
		value: 'system' as TColorScheme,
		label: 'System Mode',
		icon: PaletteIcon,
		iconClassName: 'text-green-500',
	},
]

type TColorSchemePickerProps = {
	trigger: TBaseDialogTrigger
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
		<BaseDialog
			height={400}
			trigger={trigger}
			visible={visible}
			setVisible={setVisible}
		>
			<View className="px-4 gap-4">
				{COLOR_SCHEMES.map(v => (
					<IconCard
						key={v.value}
						icon={v.icon}
						title={v.label}
						iconSize="4xl"
						iconClassName={v.iconClassName}
						onTouchStart={() => onPress(v.value)}
						className={cn({
							'border dark:border-green-500': colorScheme === v.value,
						})}
					/>
				))}
			</View>
		</BaseDialog>
	)
}
