import { ActivityIndicator } from 'react-native'

export type TSpinnerProps = {
	size?: 'small' | 'large'
	color?: string
	className?: string
}

function Spinner({ size, color, className }: TSpinnerProps) {
	return <ActivityIndicator size={size} color={color} className={className} />
}

export { Spinner }
