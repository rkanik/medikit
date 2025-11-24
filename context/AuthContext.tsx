import { TMaybe, TUser } from '@/types'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'

export type TAuthContext = {
	user: TMaybe<TUser>
	token: TMaybe<string>
	error: TMaybe<string>
	isLoading: boolean
	login: () => Promise<void>
	logout: () => Promise<void>
	setError: React.Dispatch<React.SetStateAction<TMaybe<string>>>
}

const AuthContext = createContext<TAuthContext>(null!)

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [user, setUser] = useState<TMaybe<TUser>>()
	const [token, setToken] = useState<TMaybe<string>>()
	const [error, setError] = useState<TMaybe<string>>()
	const [isLoading, setLoading] = useState(false)

	const logout = useCallback(async () => {
		setError(null)
		setLoading(true)
		try {
			await GoogleSignin.signOut()
			setUser(null)
			setToken(null)
			setError(null)
		} catch (error) {
			setError(error as string)
		}
		setLoading(false)
	}, [])

	const login = useCallback(async () => {
		setError(null)
		setLoading(true)

		// Logout if there are any existing sessions
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
		await GoogleSignin.signOut()

		// Login
		const response = await GoogleSignin.signIn()
		if (response.type === 'success') {
			setUser(response.data.user)
			setToken(response.data.idToken)
		} else {
			setError(response.data || 'Unknown error: Please try again')
		}

		setLoading(false)
	}, [])

	useEffect(() => {
		const data = GoogleSignin.getCurrentUser()
		if (data?.user) setUser(data.user)
		if (data?.idToken) setToken(data.idToken)
	}, [])

	return (
		<AuthContext.Provider
			value={{ user, token, error, isLoading, setError, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used within an AuthProvider')
	return context
}
