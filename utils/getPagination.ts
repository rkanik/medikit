import type { TPaginated } from '@/types'

export const getPagination = (query?: { page?: number; perPage?: number }) => {
	const page = query?.page ?? 1
	const perPage = query?.perPage ?? 10
	const offset = (page - 1) * perPage
	return {
		offset,
		limit: perPage,
		paginate<T>(data: T[], total = data.length) {
			const hasNextPage = page < Math.ceil(total / perPage)
			const hasPreviousPage = page > 1
			return {
				page,
				total,
				perPage,
				totalPages: Math.ceil(total / perPage),
				firstPage: 1,
				lastPage: Math.ceil(total / perPage),
				nextPage: hasNextPage ? page + 1 : undefined,
				previousPage: hasPreviousPage ? page - 1 : undefined,
				hasNextPage,
				hasPreviousPage,
				data,
			} satisfies TPaginated<T>
		},
	}
}
