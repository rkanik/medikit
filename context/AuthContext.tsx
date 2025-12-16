import { webClientId } from '@/const'
import type { TMaybe, TUser } from '@/types'
import { log } from '@/utils/logs'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import type { PropsWithChildren } from 'react'
import {
	createContext,
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

log(`[Auth]: configuring GoogleSignin`, webClientId)
GoogleSignin.configure({
	scopes: ['https://www.googleapis.com/auth/drive.file'],
	webClientId,
})

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
		} catch (error) {
			setError(error as string)
		}
		setLoading(false)
	}, [])

	const login = useCallback(async () => {
		setError(null)
		setLoading(true)
		try {
			// Logout if there are any existing sessions
			log(`[Auth]: checking play services`)
			const hasPlayServices = await GoogleSignin.hasPlayServices({
				showPlayServicesUpdateDialog: true,
			})
			log(`[Auth]: hasPlayServices: ${hasPlayServices}`)

			log(`[Auth]: signing out`)
			await GoogleSignin.signOut()
			log(`[Auth]: signed out`)

			// Login
			log(`[Auth]: signing in`)
			const response = await GoogleSignin.signIn()
			log(`[Auth]: signed in`, response)

			if (response.type === 'success') {
				setUser(response.data.user)
				setToken(response.data.idToken)
			} else {
				setError(`Prompt was cancelled by the user. Please try again.`)
			}
		} catch (error) {
			setError((error as any)?.message || 'An unknown error occurred')
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		log(`[Auth]: getting current user`)
		const data = GoogleSignin.getCurrentUser()
		log(`[Auth]: current user`, data?.user.email, data?.idToken?.length)
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
