import { useEffect, useState } from 'react'
import { Linking, ScrollView, View } from 'react-native'

import { Stack } from 'expo-router'

import { BaseCard } from '@/components/base/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Body, Subtitle, Title } from '@/components/ui/text'
import { $df } from '@/utils/dayjs'

const REPO_URL = 'https://github.com/rkanik/medikit'
const PROFILE_URL = 'https://github.com/rkanik'
const CONTRIBUTE_URL = 'https://github.com/rkanik/medikit/pulls'
const EMAIL = 'rkanik.me@gmail.com'
const WHATSAPP_URL = 'https://wa.me/8801568015679'

type GitHubUser = {
	login: string
	name: string | null
	bio: string | null
	company: string | null
	blog: string | null
	location: string | null
	avatar_url: string
	html_url: string
	hireable: boolean | null
	public_repos: number
	public_gists: number
	followers: number
	following: number
	created_at: string
	updated_at: string
}

const FALLBACK_USER: GitHubUser = {
	login: 'rkanik',
	name: 'Md Rasel Khandkar',
	bio: 'Senior Software Engineer at Encoder IT Limited',
	company: 'Encoder IT Limited',
	blog: 'https://rkanik.vercel.app',
	location: 'Dhaka, Bangladesh',
	avatar_url: 'https://avatars.githubusercontent.com/u/30260735?v=4',
	html_url: PROFILE_URL,
	hireable: true,
	public_repos: 101,
	public_gists: 0,
	followers: 20,
	following: 17,
	created_at: '2017-07-18T10:59:32Z',
	updated_at: '2026-04-06T17:45:14Z',
}

function openUrl(url: string) {
	Linking.openURL(url).catch(() => {
		//
	})
}

function normalizeBlogUrl(blog: string) {
	const trimmed = blog.trim()
	if (!trimmed) return null
	if (/^https?:\/\//i.test(trimmed)) return trimmed
	return `https://${trimmed}`
}

export default function Screen() {
	const [user, setUser] = useState<GitHubUser | null>(null)
	const [profileLoading, setProfileLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const res = await fetch('https://api.github.com/users/rkanik')
				if (!res.ok) throw new Error('GitHub request failed')
				const data = (await res.json()) as GitHubUser
				if (!cancelled) setUser(data)
			} catch {
				if (!cancelled) setUser(FALLBACK_USER)
			} finally {
				if (!cancelled) setProfileLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	const resolved = user ?? FALLBACK_USER
	const blogUrl = resolved.blog ? normalizeBlogUrl(resolved.blog) : null
	const showProfile = !profileLoading || user !== null

	return (
		<ScrollView
			contentContainerClassName="px-4 pb-20"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'About' }} />

			<BaseCard className="mt-2">
				<Title>Medikit</Title>
				<Subtitle className="mt-1">
					Privacy-first medical records on your phone
				</Subtitle>
				<Divider className="my-3" />
				<Body>
					Medikit helps you manage medical histories, prescriptions, and
					receipts. Everything stays on your device using fast local storage
					(MMKV). There is no backend or shared database—optional backup goes to
					your own Google Drive, so you stay in control of your data.
				</Body>
			</BaseCard>

			<View className="mt-4 flex-row flex-wrap gap-2">
				<Button
					className="min-w-[140px] flex-1"
					icon="github"
					text="Source on GitHub"
					onPress={() => openUrl(REPO_URL)}
				/>
				<Button
					className="min-w-[140px] flex-1"
					icon="git-branch"
					text="Contribute"
					onPress={() => openUrl(CONTRIBUTE_URL)}
				/>
			</View>

			<Title className="mt-6 mb-2">Developer</Title>
			<BaseCard>
				{!showProfile ? (
					<Body>Loading GitHub profile…</Body>
				) : (
					<>
						<View className="flex-row items-center gap-3">
							<Avatar
								image={resolved.avatar_url}
								text={resolved.name ?? resolved.login}
								className="h-16 w-16"
							/>
							<View className="min-w-0 flex-1">
								<Title numberOfLines={2}>
									{resolved.name ?? resolved.login}
								</Title>
								<Subtitle>@{resolved.login}</Subtitle>
							</View>
						</View>
						{resolved.bio ? <Body className="mt-3">{resolved.bio}</Body> : null}
						{(resolved.company || resolved.location) && (
							<Body className="mt-2">
								{[resolved.company, resolved.location]
									.filter(Boolean)
									.join(' · ')}
							</Body>
						)}
						<View className="mt-3 flex-row flex-wrap gap-2">
							<Badge text={`${resolved.public_repos} public repos`} />
							<Badge text={`${resolved.followers} followers`} />
							<Badge text={`${resolved.following} following`} />
							{resolved.public_gists > 0 ? (
								<Badge text={`${resolved.public_gists} gists`} />
							) : null}
						</View>
						<Body className="mt-3">
							GitHub since {$df(resolved.created_at, 'MMMM YYYY')}
						</Body>
						<Body className="mt-1 opacity-70">
							Profile updated {$df(resolved.updated_at, 'DD MMM YYYY')}
						</Body>
						{resolved.hireable ? (
							<Badge
								text="Open to opportunities"
								className="mt-3 self-start border-green-500 dark:border-green-400"
							/>
						) : null}
						{blogUrl ? (
							<View className="mt-3 flex-row">
								<Button
									size="sm"
									variant="base2"
									icon="external-link"
									text="Website"
									onPress={() => openUrl(blogUrl)}
								/>
							</View>
						) : null}
						<Divider className="my-3" />
						<Button
							size="sm"
							icon="github"
							text="View GitHub profile"
							variant="base2"
							className="self-start"
							onPress={() => openUrl(resolved.html_url)}
						/>
					</>
				)}
			</BaseCard>

			<Title className="mt-6 mb-2">Contact</Title>
			<View className="flex-row flex-wrap gap-2">
				<Button
					className="min-w-[140px] flex-1"
					icon="mail"
					text="Email"
					onPress={() =>
						openUrl(`mailto:${EMAIL}?subject=${encodeURIComponent('Medikit')}`)
					}
				/>
				<Button
					className="min-w-[140px] flex-1"
					icon="github"
					text="GitHub"
					onPress={() => openUrl(PROFILE_URL)}
				/>
				<Button
					className="min-w-[140px] flex-1"
					icon="message-circle"
					text="WhatsApp"
					onPress={() => openUrl(WHATSAPP_URL)}
				/>
			</View>

			<Body className="mt-6 text-center text-sm opacity-60">
				Medikit is open source. Issues and pull requests are welcome on the
				repository.
			</Body>
		</ScrollView>
	)
}
