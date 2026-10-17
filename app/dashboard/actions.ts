"use server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GEO } from "@/lib/bd-geo";

const s = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function saveProfile(_prev: string, fd: FormData): Promise<string> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return "আগে লগইন করুন।";

  const institution = s(fd.get("institution"));
  const division = s(fd.get("division"));
  const district = s(fd.get("district"));
  const upazila = s(fd.get("upazila"));
  const phone = s(fd.get("phone")).replace(/[\s-]/g, "");
  const address = s(fd.get("address")).slice(0, 200);

  if (institution.length < 2) return "প্রতিষ্ঠানের নাম লিখুন।";
  if (!GEO[division]) return "বিভাগ বেছে নিন।";
  if (!GEO[division].includes(district)) return "জেলা বেছে নিন।";
  if (upazila.length < 2) return "উপজেলার নাম লিখুন।";
  if (phone && !/^(\+?88)?01[3-9]\d{8}$/.test(phone)) return "সঠিক মোবাইল নম্বর দিন।";

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return "অ্যাকাউন্ট পাওয়া যায়নি।";
    const data = { institution, division, district, upazila, phone: phone || null, address: address || null };
    await db.teacherProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });
  } catch (e) {
    console.error("saveProfile failed:", e);
    return "সংরক্ষণ হয়নি। একটু পরে আবার চেষ্টা করুন।";
  }
  redirect("/dashboard");
}
