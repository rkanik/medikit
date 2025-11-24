const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

const BACKUP_FOLDER_NAME = "Medikit Backups";

export type DriveFile = {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
};

const request = async <T>(
  url: string,
  options: RequestInit & { accessToken: string },
): Promise<T> => {
  const { accessToken, headers, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive error: ${response.status} - ${errorText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  const buffer = await response.arrayBuffer();
  return buffer as T;
};

export const ensureBackupFolderAsync = async (accessToken: string) => {
  const query = encodeURIComponent(
    `name = '${BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
  );
  const existing = await request<{ files: DriveFile[] }>(`${DRIVE_API}/files?q=${query}&fields=files(id,name)`, {
    method: "GET",
    accessToken,
  });

  if (existing.files?.length) {
    return existing.files[0].id;
  }

  const created = await request<DriveFile>(`${DRIVE_API}/files`, {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  return created.id;
};

export const uploadBackupAsync = async ({
  accessToken,
  base64Zip,
  fileName,
  folderId,
}: {
  accessToken: string;
  base64Zip: string;
  fileName: string;
  folderId: string;
}) => {
  const boundary = "medikit-" + Date.now();
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: "application/zip",
  };

  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/zip\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
    `${base64Zip}\r\n` +
    `--${boundary}--`;

  await request<DriveFile>(`${UPLOAD_API}/files?uploadType=multipart`, {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
};

export const listBackupsAsync = async (accessToken: string, folderId: string) => {
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType = 'application/zip' and trashed = false`,
  );
  const response = await request<{ files: DriveFile[] }>(
    `${DRIVE_API}/files?q=${query}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,size)`,
    {
      method: "GET",
      accessToken,
    },
  );
  return response.files ?? [];
};

export const downloadBackupAsync = async (accessToken: string, fileId: string) => {
  const buffer = await request<ArrayBuffer>(`${DRIVE_API}/files/${fileId}?alt=media`, {
    method: "GET",
    accessToken,
  });
  return buffer;
};

