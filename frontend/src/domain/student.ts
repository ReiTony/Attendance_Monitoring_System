export type StudentApi = {
  id: string;
  first_name: string;
  last_name: string;
  section: string;
  student_id_no: string;
  rfid_uid: string;
  seat_row: 0;
  seat_col: 0;
};

export type StudentListApi = StudentApi[];
