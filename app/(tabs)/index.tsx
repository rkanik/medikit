import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { useColorSchemeStorage } from "@/hooks/useColorSchemeStorage";
import { Text } from "react-native";
import { useMMKVNumber } from "react-native-mmkv";

export default function HomeScreen() {
  const { colorScheme, setColorScheme } = useColorSchemeStorage();

  const [counter, setCounter] = useMMKVNumber("counter");

  return (
    <Box className="bg-white dark:bg-black p-16 flex-1">
      <Text className="text-black dark:text-white">{colorScheme}</Text>
      <Button
        onPress={() => {
          setColorScheme(colorScheme === "light" ? "dark" : "light");
       
        }}
      >
        <ButtonText>Toggle color mode</ButtonText>
      </Button>
      <Text
        className="text-black dark:text-white text-4xl"
        onPress={() => setCounter((v) => (v || 0) + 1)}
      >
        {counter || 0}
      </Text>
    </Box>
  );
}
