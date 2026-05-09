"use server";

import { prisma } from "@/db/prisma";
import { signToken, setAuthCookie, clearAuthCookie, AUTH_COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function loginAction(formData: any) {
  const { email, password } = formData;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Invalid email or password" };
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name || "",
    });

    await setAuthCookie(token);
    
    revalidatePath("/");
    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (err: any) {
    console.error("❌ Login error [FULL]:", err);
    console.error("❌ Login error name:", err?.name);
    console.error("❌ Login error message:", err?.message);
    console.error("❌ Login error stack:", err?.stack);
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function signupAction(formData: any) {
  const { email, password, name } = formData;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name || "",
    });

    await setAuthCookie(token);
    
    revalidatePath("/");
    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (err: any) {
    console.error("❌ Signup error [FULL]:", err);
    console.error("❌ Signup error name:", err?.name);
    console.error("❌ Signup error message:", err?.message);
    console.error("❌ Signup error stack:", err?.stack);
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  revalidatePath("/");
  return { success: true };
}

export async function getSocketToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
}
