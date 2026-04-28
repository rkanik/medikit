import type { TButtonVariants } from '@/components/ui/button/variants'
import type { TPrettify } from '@/types'
import type { RefObject } from 'react'
import type { PressableProps, View } from 'react-native'

export type TButtonProps = TPrettify<
	PressableProps &
		TButtonVariants & {
			ref?: RefObject<View>
			asChild?: boolean
		}
>
