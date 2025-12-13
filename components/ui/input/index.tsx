import { TextInput, TextInputProps } from 'react-native'
import { cn } from 'tailwind-variants'

export type TInputProps = TextInputProps & {
	size?: string
}

export const Input = ({ className, ...props }: TInputProps) => {
	return (
		<TextInput
			{...props}
			className={cn(
				'border border-gray-300 dark:border-gray-700 rounded-md p-2',
				className,
			)}
		/>
	)
}
