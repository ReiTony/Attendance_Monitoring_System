"use server";

import { TeacherRegisterForm } from "@/dto/teacherRegisterForm";
import { authRegister } from "@/services/teacherService";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signup(_prev: { message?: string }, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const section = formData.get("section") as string;

  // Server-side validation
  // Validate password
  if (!password || password === "") {
    return { message: "Please enter a valid password" };
  }

  if (password !== confirmPassword) {
    return { message: "Passwords do not match" };
  }

  if (password.length < 6) {
    return {
      message: "Password must be at least 6 characters long",
    };
  }

  const teacherRegisterForm: TeacherRegisterForm = {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    section,
  };

  const registrationResult = await authRegister(teacherRegisterForm);

  if (!registrationResult.ok) {
    return { message: registrationResult.error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
