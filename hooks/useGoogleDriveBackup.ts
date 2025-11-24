import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useMMKVObject } from "react-native-mmkv";

import {
  buildBackupArchiveAsync,
  extractBackupArchiveAsync,
} from "@/services/backup";
import {
  downloadBackupAsync,
  ensureBackupFolderAsync,
  listBackupsAsync,
  uploadBackupAsync,
  type DriveFile,
} from "@/services/googleDrive";
import type { MedicalRecord } from "@/types/medical";
import { storage } from "@/utils/storage";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_TTL_MS = 55 * 60 * 1000;

const googleConfig: Parameters<typeof GoogleSignin.configure>[0] = {
  scopes: SCOPES,
};

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
if (webClientId) {
  googleConfig.webClientId = webClientId;
}

GoogleSignin.configure(googleConfig);

type DriveAuthState = {
  accessToken: string;
  expiresAt: number;
  lastBackupAt?: string;
  lastRestoreAt?: string;
  folderId?: string;
};

const STORAGE_KEY = "google-drive-auth";

// const clientIds = {
//   // expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
//   androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
//   iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
//   webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
// };

// const ensureClientIds = () => {
//   if (Platform.OS === "android" && !clientIds.androidClientId) {
//     throw new Error("Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID");
//   }
//   if (Platform.OS === "ios" && !clientIds.iosClientId) {
//     throw new Error("Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID");
//   }
//   if (Platform.OS === "web" && !clientIds.webClientId) {
//     throw new Error("Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
//   }
// };

export const useGoogleDriveBackup = () => {
  const [authState, setAuthState] = useMMKVObject<DriveAuthState>(
    STORAGE_KEY,
    storage
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const isAuthenticated = Boolean(
    authState?.accessToken && authState.expiresAt > Date.now()
  );

  const refreshAccessToken = useCallback(async () => {
    const tokens = await GoogleSignin.getTokens();
    if (!tokens?.accessToken) {
      throw new Error("Google did not return an access token.");
    }
    const nextState: DriveAuthState = {
      ...(authState ?? {}),
      accessToken: tokens.accessToken,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    };
    setAuthState(nextState);
    return tokens.accessToken;
  }, [TOKEN_TTL_MS, authState, setAuthState]);

  const ensureAccessToken = useCallback(async () => {
    if (authState?.accessToken && authState.expiresAt > Date.now()) {
      return authState.accessToken;
    }
    return refreshAccessToken();
  }, [authState, refreshAccessToken]);

  const startSignInFlow = useCallback(async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut();
    const signInResponse = await GoogleSignin.signIn();
    if ("type" in signInResponse && signInResponse.type !== "success") {
      throw new Error("Google sign-in was cancelled");
    }
    await refreshAccessToken();
    return signInResponse;
  }, [refreshAccessToken]);

  const connectGoogle = useCallback(async () => {
    try {
      await startSignInFlow();
      Alert.alert(
        "Google connected",
        "Medikit can now backup to your Drive. Tap Backup when ready."
      );
    } catch (error: any) {
      Alert.alert("Google Sign-in failed", error.message ?? "Unknown error");
    }
  }, [startSignInFlow]);

  const disconnectGoogle = useCallback(async () => {
    await GoogleSignin.signOut();
    setAuthState(undefined);
  }, [setAuthState]);

  const backupToDrive = useCallback(
    async (records: MedicalRecord[]) => {
      if (!records.length) {
        throw new Error("You do not have any records to backup yet.");
      }
      setIsSyncing(true);
      try {
        const accessToken = await ensureAccessToken();
        const folderId =
          authState?.folderId ?? (await ensureBackupFolderAsync(accessToken));
        const { base64Zip } = await buildBackupArchiveAsync(records);
        const fileName = `medikit-backup-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.zip`;
        await uploadBackupAsync({ accessToken, base64Zip, folderId, fileName });
        setAuthState({
          ...(authState ?? {
            accessToken,
            expiresAt: Date.now() + 3600 * 1000,
          }),
          accessToken,
          folderId,
          lastBackupAt: new Date().toISOString(),
        });
      } finally {
        setIsSyncing(false);
      }
    },
    [authState, ensureAccessToken, setAuthState]
  );

  const restoreLatestBackup = useCallback(async () => {
    setIsSyncing(true);
    try {
      const accessToken = await ensureAccessToken();
      const folderId =
        authState?.folderId ?? (await ensureBackupFolderAsync(accessToken));
      const backups = await listBackupsAsync(accessToken, folderId);
      if (!backups.length) {
        throw new Error("No backups were found in your Google Drive yet.");
      }
      const latest = backups[0];
      const buffer = await downloadBackupAsync(accessToken, latest.id);
      const restored = await extractBackupArchiveAsync(buffer);
      setAuthState({
        ...(authState ?? { accessToken, expiresAt: Date.now() + 3600 * 1000 }),
        accessToken,
        folderId,
        lastRestoreAt: new Date().toISOString(),
      });
      return {
        ...restored,
        backupFile: latest as DriveFile,
      };
    } finally {
      setIsSyncing(false);
    }
  }, [authState, ensureAccessToken, setAuthState]);

  useEffect(() => {
    const user = GoogleSignin.getCurrentUser();
    console.log("user", user, authState);
  }, []);

  return {
    isAuthenticated,
    connectGoogle,
    disconnectGoogle,
    backupToDrive,
    restoreLatestBackup,
    isSyncing,
    authState,
  };
};
