import type { TCalendarProps } from './types'
import type { DayButton } from 'react-day-picker'

import { useEffect, useRef } from 'react'

import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { cn } from 'tailwind-variants'

import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { $df } from '@/utils/dayjs'

export * from './types'

const Calendar = ({ selected, ...props }: TCalendarProps) => {
	const defaultClassNames = getDefaultClassNames()
	return (
		<DayPicker
			mode="single"
			selected={selected}
			defaultMonth={selected}
			showOutsideDays={true}
			captionLayout="dropdown"
			classNames={{
				root: 'w-fit',
				months: 'flex gap-4 flex-col md:flex-row relative',
				month: 'flex flex-col w-full gap-4',
				nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
				button_previous: buttonVariants({
					size: 'xs',
					variant: 'outline',
					className: 'aria-disabled:opacity-50 select-none p-0 size-8',
				}),
				button_next: buttonVariants({
					size: 'xs',
					variant: 'outline',
					className: 'aria-disabled:opacity-50 select-none p-0 size-8',
				}),
				month_caption: cn(
					'flex items-center justify-center h-8 w-full px-8',
					defaultClassNames.month_caption,
				),
				dropdowns: cn(
					'w-full flex items-center justify-center gap-4',
					defaultClassNames.dropdowns,
				),
				dropdown_root: cn(
					'relative cn-calendar-dropdown-root rounded-lg',
					defaultClassNames.dropdown_root,
				),
				dropdown: cn(
					'absolute bg-neutral-50 inset-0 opacity-0',
					defaultClassNames.dropdown,
				),
				caption_label:
					'select-none font-medium cn-calendar-caption-label rounded-lg flex items-center gap-1 text-sm',
				table: 'w-full border-collapse',
				weekdays: cn('flex', defaultClassNames.weekdays),
				weekday: cn(
					'text-muted-foreground rounded-lg flex-1 font-normal text-[0.8rem] select-none',
					defaultClassNames.weekday,
				),
				week: cn('flex w-full mt-2', defaultClassNames.week),
				week_number_header: cn(
					'select-none w-8',
					defaultClassNames.week_number_header,
				),
				week_number: cn(
					'text-[0.8rem] select-none text-muted-foreground',
					defaultClassNames.week_number,
				),
				range_start: cn(
					'rounded-l-lg bg-muted relative after:bg-muted after:absolute after:inset-y-0 after:w-4 after:right-0 z-0 isolate',
					defaultClassNames.range_start,
				),
				range_middle: cn('rounded-none', defaultClassNames.range_middle),
				range_end: cn(
					'rounded-r-lg bg-muted relative after:bg-muted after:absolute after:inset-y-0 after:w-4 after:left-0 z-0 isolate',
					defaultClassNames.range_end,
				),
				today: '[&_span]:bg-neutral-200',
				outside:
					'text-secondary-foreground aria-selected:text-secondary-foreground',
				disabled: cn(
					'text-muted-foreground opacity-50',
					defaultClassNames.disabled,
				),
				hidden: cn('invisible', defaultClassNames.hidden),
			}}
			components={{
				DayButton: ({ ...props }) => <CalendarDayButton {...props} />,
				Root: ({ className, rootRef, ...props }) => {
					return (
						<div
							ref={rootRef}
							data-slot="calendar"
							className={className}
							{...props}
						/>
					)
				},
				Chevron: ({ orientation, ...props }) => {
					if (orientation === 'left') {
						return <Icon {...props} name="chevron-left" />
					}
					if (orientation === 'right') {
						return <Icon {...props} name="chevron-right" />
					}
					return <Icon {...props} name="chevron-down" />
				},
			}}
			{...props}
		/>
	)
}

const CalendarDayButton = ({
	day,
	className,
	modifiers,
	...props
}: React.ComponentProps<typeof DayButton>) => {
	const defaultClassNames = getDefaultClassNames()
	const ref = useRef<HTMLButtonElement>(null)
	useEffect(() => {
		if (modifiers.focused) ref.current?.focus()
	}, [modifiers.focused])

	return (
		<span
			role="button"
			data-day={$df(day.date, 'YYYY-MM-DD')}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			className={cn(
				'flex size-8 items-center justify-center rounded-lg data-[selected-single=true]:bg-primary',
				defaultClassNames.day,
				className,
			)}
			{...props}
		/>
	)
}

export { Calendar, CalendarDayButton }
