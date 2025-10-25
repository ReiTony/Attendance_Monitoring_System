export type StudentView = {
  id: string;
  firstName: string;
  lastName: string;
  section: string;
  studentIdNo: string;
  rfid_uid: string;
  seatRow: 0;
  seatCol: 0;
};

export type StudentListView = StudentView[];
