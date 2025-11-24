import type { TBaseModalProps } from './types'
import { useMemo } from 'react'
import { Pressable } from 'react-native'

type TOptions = Pick<TBaseModalProps, 'footer' | 'children' | 'trigger'> & {
	onClose: () => void
	onPress: () => void
}

export const useModal = ({
	footer,
	trigger,
	children,
	onClose,
	onPress,
}: TOptions) => {
	//
	const iFooter = useMemo(() => {
		return typeof footer === 'function' ? footer({ close: onClose }) : footer
	}, [footer, onClose])

	const iChildren = useMemo(() => {
		return typeof children === 'function'
			? children({ close: onClose })
			: children
	}, [children, onClose])

	const iTrigger = useMemo(() => {
		if (!trigger) return
		if (typeof trigger === 'function') return trigger({ onPress })
		return <Pressable onPress={onPress}>{trigger}</Pressable>
	}, [trigger, onPress])

	return {
		iFooter,
		iTrigger,
		iChildren,
	}
}
