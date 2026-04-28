import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export const useTagsQuery = () => {
	return useQuery({
		queryKey: ['tags'],
		initialData: [],
		queryFn() {
			return db.query.tags.findMany({
				orderBy: (v, { asc }) => [asc(v.name)],
			})
		},
	})
}
