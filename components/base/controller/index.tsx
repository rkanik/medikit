import {
	FormControl,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
	FormControlHelper,
	FormControlHelperText,
	FormControlLabel,
	FormControlLabelText,
} from '@/components/ui/form-control'
import { AlertCircleIcon } from 'lucide-react-native'
import type {
	Control,
	ControllerFieldState,
	ControllerRenderProps,
	FieldValues,
	Path,
	UseFormStateReturn,
} from 'react-hook-form'
import { Controller } from 'react-hook-form'

export type TBaseControllerProps<T extends FieldValues> = React.ComponentProps<
	typeof FormControl
> & {
	label?: string
	helperText?: string
	name: Path<T>
	control: Control<T>
}

type TProps<T extends FieldValues> = TBaseControllerProps<T> & {
	render: (v: {
		field: ControllerRenderProps<T, Path<T>>
		fieldState: ControllerFieldState
		formState: UseFormStateReturn<T>
	}) => React.ReactNode
}

export const BaseController = <T extends FieldValues>(props: TProps<T>) => {
	return (
		<Controller
			name={props.name}
			control={props.control}
			render={v => (
				<FormControl
					size={props.size || 'lg'}
					className={props.className}
					isInvalid={!!v.fieldState.error}
					isDisabled={props.isDisabled}
					isReadOnly={props.isReadOnly}
					isRequired={props.isRequired}
				>
					{props.label && (
						<FormControlLabel>
							<FormControlLabelText>{props.label}</FormControlLabelText>
						</FormControlLabel>
					)}
					{props.render(v)}
					{props.helperText && (
						<FormControlHelper>
							<FormControlHelperText>{props.helperText}</FormControlHelperText>
						</FormControlHelper>
					)}
					{v.fieldState.error && (
						<FormControlError>
							<FormControlErrorIcon
								as={AlertCircleIcon}
								className="text-red-500"
							/>
							<FormControlErrorText className="text-red-500">
								{v.fieldState.error?.message}
							</FormControlErrorText>
						</FormControlError>
					)}
				</FormControl>
			)}
		/>
	)
}
