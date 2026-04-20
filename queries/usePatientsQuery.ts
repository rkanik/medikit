import { db } from '@/drizzle/db'
import { useQuery } from '@/hooks/useQuery'

export const usePatientsQuery = () => {
	return useQuery({
		queryKey: ['patients'],
		initialData: [],
		queryFn() {
			return db.query.patients.findMany()
		},
	})
}
