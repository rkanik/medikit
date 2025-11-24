import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useState } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  return (
    <GluestackUIProvider mode={colorMode}>
      <StatusBar style={colorMode} />
      <Box className="bg-primary-500 p-16">
        <Button
          onPress={() => {
            setColorMode(colorMode === 'light' ? 'dark' : 'light');
          }}
        >
          <ButtonText>Toggle color mode</ButtonText>
        </Button>
      </Box>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </GluestackUIProvider>

  );
}
