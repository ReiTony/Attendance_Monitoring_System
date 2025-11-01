"use client";

import { Modal, Button, Stack, TextInput, Alert, Text } from "@mantine/core";
import { useRfid } from "@/hooks/rfid/useRfid";
import { useState, useEffect } from "react";

interface RecordAttendanceModalProps {
  opened: boolean;
  onClose: () => void;
}

const RecordAttendanceModal = ({
  opened,
  onClose,
}: RecordAttendanceModalProps) => {
  const { record, attendanceRecord, success, loading, error } = useRfid();
  const [rfidValue, setRfidValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rfidValue.trim()) {
      await record(rfidValue);
      setRfidValue(""); // Clear input after submission
    }
  };

  // Clear messages when modal closes
  useEffect(() => {
    if (!opened) {
      setRfidValue("");
    }
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Record Attendance" centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="RFID"
            value={rfidValue}
            onChange={(e) => setRfidValue(e.currentTarget.value)}
            placeholder="Enter RFID"
            required
            autoFocus
          />

          {success && (
            <Alert color="green" title="Success">
              {success}
            </Alert>
          )}

          {attendanceRecord && (
            <Alert color="blue" title="Attendance Record">
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Student:</strong> {attendanceRecord.studentName}
                </Text>
                <Text size="sm">
                  <strong>Status:</strong> {attendanceRecord.status}
                </Text>
                <Text size="sm">
                  <strong>Time:</strong>{" "}
                  {attendanceRecord.timeIn
                    ? new Date(attendanceRecord.timeIn).toLocaleString()
                    : "N/A"}
                </Text>
              </Stack>
            </Alert>
          )}

          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          <Button type="submit" loading={loading} fullWidth>
            Record Attendance
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default RecordAttendanceModal;
