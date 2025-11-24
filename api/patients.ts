import { useCallback } from "react";
import { useMMKVObject } from "react-native-mmkv";

export type TPatient = {
  id: number;
  name: string;
  avatar?: string;
};

const usePatients = () => {
  const [patients, setPatients] = useMMKVObject<TPatient[]>("patients");

  const addPatient = useCallback(
    (patient: TPatient) => {
      setPatients((patients = []) => {
        return [...patients, patient];
      });
    },
    [setPatients]
  );

  return {
    patients,
  };
};

export const patients = {
  usePatients,
};
