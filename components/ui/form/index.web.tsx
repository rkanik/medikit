import { forwardRef, useImperativeHandle } from 'react'
import { cn } from 'tailwind-variants'
import type { TFormProps, TFormRef, TFormSubmitProps } from './types'

const Form = forwardRef<TFormRef, TFormProps>(function Form(
	{ children, className, touchable: _, onSubmit, ...props }: TFormProps,
	ref,
) {
	useImperativeHandle(ref, () => ({
		submit: onSubmit,
	}))
	return (
		<form
			{...(props as any)}
			className={cn('flex flex-col', className)}
			onSubmit={e => {
				e.preventDefault()
				onSubmit?.(e)
			}}
		>
			{children}
		</form>
	)
})

export const useCurrentForm = () => {
	//
}

const FormSubmit = ({ children, loading, disabled }: TFormSubmitProps) => {
	return (
		<button type="submit" disabled={loading || disabled}>
			{children({ loading, disabled })}
		</button>
	)
}

export { Form, FormSubmit }
