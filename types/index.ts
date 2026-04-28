export type TColorScheme = 'light' | 'dark'
export type TColorSchemeStorage = TColorScheme | 'system'

export type TNullable<T> = T | null
export type TOptional<T> = T | undefined

export type TMaybe<T> = T | null | undefined

export type TUser = {
	id: string
	email: string
	name: TMaybe<string>
	photo: TMaybe<string>
}

export type TPaginated<T> = {
	page: number
	total: number
	perPage: number
	totalPages: number
	firstPage: number
	lastPage: number
	nextPage?: number
	previousPage?: number
	hasNextPage: boolean
	hasPreviousPage: boolean
	data: T[]
}

export type TPrettify<T> = {
	[K in keyof T]: T[K]
} & unknown

export type TColors = {
	background: string
	foreground: string
	card: string
	'card-foreground': string
	popover: string
	'popover-foreground': string
	primary: string
	'primary-foreground': string
	secondary: string
	'secondary-foreground': string
	muted: string
	'muted-foreground': string
	accent: string
	'accent-foreground': string
	destructive: string
	'destructive-foreground': string
	border: string
	input: string
	ring: string
	radius: string
	'chart-1': string
	'chart-2': string
	'chart-3': string
	'chart-4': string
	'chart-5': string
}
