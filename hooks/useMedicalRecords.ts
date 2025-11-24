import { useCallback, useMemo } from "react";
import { useMMKVObject } from "react-native-mmkv";

import type { MedicalAttachment, MedicalRecord } from "@/types/medical";
import { createId } from "@/utils/id";
import { storage } from "@/utils/storage";

const STORAGE_KEY = "medical-records";

type NewRecordInput = {
  title: string;
  notes?: string;
  doctor?: string;
  hospital?: string;
  amount?: number;
  attachments?: MedicalAttachment[];
};

export function useMedicalRecords() {
  const [records, setRecords] = useMMKVObject<MedicalRecord[]>(STORAGE_KEY, storage);

  const resolvedRecords = useMemo(() => records ?? [], [records]);

  const persist = useCallback(
    (updater: (prev: MedicalRecord[]) => MedicalRecord[]) => {
      setRecords(updater(records ?? []));
    },
    [records, setRecords],
  );

  const addRecord = useCallback(
    (input: NewRecordInput) => {
      if (!input.title?.trim()) {
        throw new Error("Title is required");
      }

      const now = new Date().toISOString();
      const newRecord: MedicalRecord = {
        id: createId(),
        title: input.title.trim(),
        notes: input.notes?.trim(),
        doctor: input.doctor?.trim(),
        hospital: input.hospital?.trim(),
        amount: input.amount,
        createdAt: now,
        updatedAt: now,
        attachments: input.attachments ?? [],
      };

      persist((prev) => [newRecord, ...prev]);
      return newRecord;
    },
    [persist],
  );

  const upsertRecord = useCallback(
    (record: MedicalRecord) => {
      persist((prev) => {
        const idx = prev.findIndex((item) => item.id === record.id);
        if (idx === -1) {
          return [record, ...prev];
        }
        const next = [...prev];
        next[idx] = record;
        return next;
      });
    },
    [persist],
  );

  const removeRecord = useCallback(
    (recordId: string) => {
      persist((prev) => prev.filter((item) => item.id !== recordId));
    },
    [persist],
  );

  const replaceAll = useCallback(
    (next: MedicalRecord[]) => {
      setRecords(next);
    },
    [setRecords],
  );

  const clearAll = useCallback(() => {
    replaceAll([]);
  }, [replaceAll]);

  return {
    records: resolvedRecords,
    addRecord,
    upsertRecord,
    removeRecord,
    clearAll,
    replaceAll,
  };
}

