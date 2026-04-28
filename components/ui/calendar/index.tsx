import type { TCalendarProps } from './types'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'

export * from './types'

const Calendar = (_: TCalendarProps) => {
	return (
		<View>
			<Text>Calendar</Text>
		</View>
	)
}

export { Calendar }
