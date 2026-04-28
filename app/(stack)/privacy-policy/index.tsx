import { Linking, ScrollView, View } from 'react-native'

import { Stack } from 'expo-router'

import { BaseCard } from '@/components/base/card'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { Body, Subtitle, Title } from '@/components/ui/text'

const CONTACT_EMAIL = 'rkanik.me@gmail.com'
const REPO_URL = 'https://github.com/rkanik/medikit'

function openUrl(url: string) {
	Linking.openURL(url).catch(() => {
		//
	})
}

export default function Screen() {
	return (
		<ScrollView
			contentContainerClassName="px-4 pb-20"
			contentContainerStyle={{ flexGrow: 1 }}
		>
			<Stack.Screen options={{ title: 'Privacy Policy' }} />

			<BaseCard className="mt-2">
				<Title>Privacy Policy</Title>
				<Subtitle className="mt-1">Medikit · Last updated April 2026</Subtitle>
				<Divider className="my-3" />
				<Body>
					This policy describes how Medikit handles information. The app is
					designed so your health data stays under your control.
				</Body>
			</BaseCard>

			<BaseCard className="mt-4">
				<Title className="text-base">Data on your device</Title>
				<Body className="mt-2">
					Patients, visits, notes, amounts, tags, and attachments you add are
					stored locally on your phone. Medikit does not send this data to our
					servers—we do not operate a backend or shared database for your
					records.
				</Body>
			</BaseCard>

			<BaseCard className="mt-4">
				<Title className="text-base">Google Drive (optional)</Title>
				<Body className="mt-2">
					If you turn on backup, you sign in with Google and files are stored in
					your own Google Drive account. That processing is subject to the Google
					terms and privacy policy. You can stop using backup or disconnect at
					any time in the app.
				</Body>
			</BaseCard>

			<BaseCard className="mt-4">
				<Title className="text-base">Permissions</Title>
				<Body className="mt-2">
					The app may ask for access to your camera and photo library only so you
					can attach images (e.g. prescriptions or receipts). You can deny these
					and still use other parts of the app where they are not required.
				</Body>
			</BaseCard>

			<BaseCard className="mt-4">
				<Title className="text-base">Analytics and ads</Title>
				<Body className="mt-2">
					Medikit does not include third-party analytics or advertising SDKs for
					tracking your use of the app. Optional Google services apply only when
					you use sign-in or Drive backup.
				</Body>
			</BaseCard>

			<BaseCard className="mt-4">
				<Title className="text-base">Changes and contact</Title>
				<Body className="mt-2">
					We may update this policy occasionally. The open-source project lives on
					GitHub; you can review the code and open issues there.
				</Body>
				<Divider className="my-3" />
				<View className="flex-row flex-wrap gap-2">
					<Button
						className="min-w-[140px] flex-1"
						size="sm"
						icon="mail"
						text="Email"
						onPress={() =>
							openUrl(
								`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Medikit privacy')}`,
							)
						}
					/>
					<Button
						className="min-w-[140px] flex-1"
						size="sm"
						variant="base2"
						icon="github"
						text="GitHub"
						onPress={() => openUrl(REPO_URL)}
					/>
				</View>
			</BaseCard>
		</ScrollView>
	)
}
