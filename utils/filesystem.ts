import * as FileSystem from "expo-file-system/legacy";

const ROOT_DIR = `${FileSystem.documentDirectory}medikit`;

export const ensureMedikitDirAsync = async () => {
  const dirInfo = await FileSystem.getInfoAsync(ROOT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true });
  }
  return ROOT_DIR;
};

export const writeBase64FileAsync = async ({
  fileName,
  base64,
  subDir = "",
}: {
  fileName: string;
  base64: string;
  subDir?: string;
}) => {
  const dir = await ensureMedikitDirAsync();
  const folder = subDir ? `${dir}/${subDir}` : dir;
  const folderInfo = await FileSystem.getInfoAsync(folder);
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  }
  const target = `${folder}/${fileName}`;
  await FileSystem.writeAsStringAsync(target, base64, {
    encoding: "base64",
  });
  return target;
};

export const copyIntoMedikitDirAsync = async ({
  sourceUri,
  fileName,
  subDir = "",
}: {
  sourceUri: string;
  fileName: string;
  subDir?: string;
}) => {
  const dir = await ensureMedikitDirAsync();
  const folder = subDir ? `${dir}/${subDir}` : dir;
  const folderInfo = await FileSystem.getInfoAsync(folder);
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  }
  const target = `${folder}/${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: target });
  return target;
};

export const deleteFileIfExistsAsync = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // no-op
  }
};
