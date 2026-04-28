import type { TDialogProps } from '@/components/ui/dialog'
import type {
	PopoverContentProps,
	PopoverProps,
	PopoverTriggerProps,
} from '@radix-ui/react-popover'

import { View } from 'react-native'

import { Dialog, DialogContent, DialogTrigger } from '../dialog'

export type TPopoverProps = PopoverProps & TDialogProps
const Popover: React.FC<TPopoverProps> = Dialog

const PopoverTrigger: React.FC<PopoverTriggerProps> = DialogTrigger

const PopoverAnchor = View

const PopoverContent: React.FC<PopoverContentProps> = DialogContent

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
