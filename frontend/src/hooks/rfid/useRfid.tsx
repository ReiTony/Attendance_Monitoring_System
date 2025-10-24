import { postRfid } from "@/services/rfidServices";
import { useState } from "react";

export function useRfid() {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined | null>(null);

  const record = async (rfid: string) => {
    setLoading(true);

    const result = await postRfid(rfid);

    if ("error" in result) {
      setError(result.error.message);
    } else {
      setSuccess("Attendance Recorded!");
    }

    setLoading(false);
  };

  return {
    record,
    success,
    loading,
    error,
  };
}
