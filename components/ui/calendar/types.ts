import type { PropsBase, PropsSingle } from 'react-day-picker'

export type TCalendarProps = Pick<
	PropsBase & PropsSingle,
	'selected' | 'disabled' | 'onSelect'
>
