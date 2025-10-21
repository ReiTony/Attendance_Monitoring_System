export type Teacher = {
  id: string;
  first_name: string;
  last_name: string;
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
