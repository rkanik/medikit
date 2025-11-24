import * as FileSystem from "expo-file-system";
import JSZip from "jszip";

import type {
  MedicalAttachment,
  MedicalBackupPayload,
  MedicalRecord,
} from "@/types/medical";
import { writeBase64FileAsync } from "@/utils/filesystem";

const ATTACHMENTS_DIR = "attachments";

const buildAttachmentBackupPath = (attachment: MedicalAttachment) => {
  const sanitizedName = attachment.name.replace(/[^a-z0-9._-]/gi, "_");
  return `${ATTACHMENTS_DIR}/${attachment.id}-${sanitizedName}`;
};

export const buildBackupArchiveAsync = async (records: MedicalRecord[]) => {
  const zip = new JSZip();
  const payload: MedicalBackupPayload = {
    createdAt: new Date().toISOString(),
    records: records.map((record) => ({
      ...record,
      attachments: record.attachments.map((attachment) => ({
        ...attachment,
        uri: buildAttachmentBackupPath(attachment),
      })),
    })),
    attachments: [],
  };

  for (const record of records) {
    for (const attachment of record.attachments) {
      try {
        const attachmentBase64 = await FileSystem.readAsStringAsync(
          attachment.uri,
          {
            encoding: 'base64',
          }
        );
        const backupPath = buildAttachmentBackupPath(attachment);
        zip.file(backupPath, attachmentBase64, { base64: true, binary: false });
        payload.attachments.push({
          ...attachment,
          uri: backupPath,
          backupPath,
        });
      } catch (error) {
        console.warn("Failed to read attachment", attachment.uri, error);
      }
    }
  }

  zip.file("backup.json", JSON.stringify(payload, null, 2));

  const base64Zip = await zip.generateAsync({ type: "base64" });

  return {
    base64Zip,
    sizeInBytes: Math.round((base64Zip.length * 3) / 4),
  };
};

export const extractBackupArchiveAsync = async (arrayBuffer: ArrayBuffer) => {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const payloadFile = zip.file("backup.json");
  if (!payloadFile) {
    throw new Error("Invalid backup: missing backup.json");
  }
  const payload = JSON.parse(
    await payloadFile.async("string")
  ) as MedicalBackupPayload;
  const restoredRecords: MedicalRecord[] = [];

  for (const record of payload.records) {
    const restoredAttachments: MedicalAttachment[] = [];
    for (const attachment of record.attachments) {
      const file = zip.file(attachment.uri);
      if (!file) {
        console.warn("Attachment missing from archive", attachment.uri);
        continue;
      }
      const base64 = await file.async("base64");
      const targetPath = await writeBase64FileAsync({
        fileName: attachment.name,
        base64,
        subDir: ATTACHMENTS_DIR,
      });
      restoredAttachments.push({
        ...attachment,
        uri: targetPath,
      });
    }
    restoredRecords.push({
      ...record,
      attachments: restoredAttachments,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    payload,
    records: restoredRecords,
  };
};
