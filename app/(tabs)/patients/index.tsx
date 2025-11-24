import { BaseModal } from '@/components/base/modal'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab'
import { Input, InputField } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { PlusIcon } from 'lucide-react-native'
import { useState } from 'react'

export default function PatientsScreen() {
	const [visible, setVisible] = useState(false)

	return (
		<Box className="px-4 flex-1">
			<Fab placement="bottom right" onPress={() => setVisible(true)}>
				<FabIcon as={PlusIcon} />
				<FabLabel>Add Patient</FabLabel>
			</Fab>

			<BaseModal
				title="Add Patient"
				visible={visible}
				onChangeVisible={setVisible}
				footer={
					<Button>
						<ButtonText>Add Patient</ButtonText>
					</Button>
				}
			>
				<Box className="gap-4 pb-8">
					<Box>
						<Text className="mb-2">Patient Name</Text>
						<Input>
							<InputField placeholder="Enter patient name" />
						</Input>
					</Box>
					<Box>
						<Text className="mb-2">Age</Text>
						<Input>
							<InputField placeholder="Enter age" keyboardType="numeric" />
						</Input>
					</Box>
					<Box>
						<Text className="mb-2">Phone Number</Text>
						<Input>
							<InputField
								placeholder="Enter phone number"
								keyboardType="phone-pad"
							/>
						</Input>
					</Box>
					<Box>
						<Text className="mb-2">Notes</Text>
						<Input>
							<InputField
								placeholder="Additional notes"
								multiline
								numberOfLines={4}
							/>
						</Input>
					</Box>
				</Box>
			</BaseModal>
		</Box>
	)
}
