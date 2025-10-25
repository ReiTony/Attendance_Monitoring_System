export type ClassSeat = {
  firstName: string;
  lastName: string;
  studentId: string;
  section: string;
  seatRow: number;
  seatCol: number;
};

export type ClassSeatPlan = ClassSeat[];
