export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  section: string;
  role: string;
};

export type TeacherWithAccessToken = {
  access_token: string;
  token_type: string;
  teacher: Teacher;
};
