export type TColorScheme = 'light' | 'dark' | 'system'

export type TNullable<T> = T | null
export type TOptional<T> = T | undefined

export type TMaybe<T> = T | null | undefined

export type TUser = {
	id: string
	email: string
	name: TMaybe<string>
	photo: TMaybe<string>
}
