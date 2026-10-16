"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function register(formData: FormData) {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const neighborhood = str(formData, "neighborhood");
  if (!name || !email || password.length < 8) redirect("/register?error=invalid");
  if (await prisma.user.findUnique({ where: { email } })) redirect("/register?error=taken");
  await prisma.user.create({
    data: { name, email, neighborhood, passwordHash: await bcrypt.hash(password, 10) },
  });
  await signIn("credentials", { email, password, redirectTo: "/profile" });
}

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: str(formData, "email"),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/matches",
    });
  } catch (e) {
    if (e instanceof AuthError) redirect("/login?error=1");
    throw e; // let Next.js handle the success redirect
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: str(formData, "name") || undefined,
      neighborhood: str(formData, "neighborhood"),
      bio: str(formData, "bio"),
    },
  });
  revalidatePath("/profile");
}

export async function addSkill(kind: "offer" | "want", formData: FormData) {
  const user = await requireUser();
  const name = norm(String(formData.get("name") ?? ""));
  if (!name) return;
  const note = str(formData, "note") || null;
  const skill = await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
  const key = { userId_skillId: { userId: user.id, skillId: skill.id } };
  const data = { userId: user.id, skillId: skill.id, note };
  if (kind === "offer") await prisma.offer.upsert({ where: key, update: { note }, create: data });
  else await prisma.want.upsert({ where: key, update: { note }, create: data });
  revalidatePath("/profile");
}

export async function removeSkill(kind: "offer" | "want", skillId: string) {
  const user = await requireUser();
  const where = { userId: user.id, skillId };
  if (kind === "offer") await prisma.offer.deleteMany({ where });
  else await prisma.want.deleteMany({ where });
  revalidatePath("/profile");
}

export async function sendRequest(formData: FormData) {
  const user = await requireUser();
  const toUserId = str(formData, "toUserId");
  if (!toUserId || toUserId === user.id) return;
  const already = await prisma.swapRequest.findFirst({
    where: { fromUserId: user.id, toUserId, status: "pending" },
  });
  if (already) return;
  await prisma.swapRequest.create({
    data: {
      fromUserId: user.id,
      toUserId,
      offeredSkillId: str(formData, "offeredSkillId") || null,
      wantedSkillId: str(formData, "wantedSkillId") || null,
      message: str(formData, "message").slice(0, 500),
    },
  });
  revalidatePath("/matches");
  revalidatePath("/inbox");
}

export async function respondRequest(id: string, status: "accepted" | "declined") {
  const user = await requireUser();
  await prisma.swapRequest.updateMany({
    where: { id, toUserId: user.id, status: "pending" },
    data: { status },
  });
  revalidatePath("/inbox");
}
