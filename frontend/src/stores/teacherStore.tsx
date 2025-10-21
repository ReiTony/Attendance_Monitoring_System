import { Teacher } from "@/domain/teacher";
import { create } from "zustand";

type TeacherStore = {
  teacher: Teacher | null;
  setTeacher: (teacher: Teacher) => void;
  clearTeacher: () => void;
};

export const useTeacherStore = create<TeacherStore>((set) => ({
  teacher: null,
  setTeacher: (teacher: Teacher) => {
    set({ teacher: teacher });
  },
  clearTeacher: () => {
    set({ teacher: null });
  },
}));
