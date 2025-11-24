export type AttachmentType = "prescription" | "receipt" | "report" | "other";

export type MedicalAttachment = {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  type: AttachmentType;
  size?: number;
};

export type MedicalRecord = {
  id: string;
  title: string;
  notes?: string;
  doctor?: string;
  hospital?: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
  attachments: MedicalAttachment[];
};

export type MedicalBackupPayload = {
  createdAt: string;
  records: MedicalRecord[];
  attachments: Array<MedicalAttachment & { backupPath: string }>;
  appVersion?: string;
};

