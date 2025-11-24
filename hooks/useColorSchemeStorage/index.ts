import { TColorScheme } from "@/types";
import { useMMKVString } from "react-native-mmkv";

export const useColorSchemeStorage = () => {
  const [colorScheme = 'light', setColorScheme] = useMMKVString("colorScheme");
  return {
    colorScheme,
    setColorScheme,
  } as {
    colorScheme: TColorScheme;
    setColorScheme: React.Dispatch<React.SetStateAction<TColorScheme>>;
  };
};
