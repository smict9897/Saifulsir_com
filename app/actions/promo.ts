"use server";

import { db } from "@/lib/db";
import { staff } from "@/lib/guard";
import { revalidatePath } from "next/cache";

export interface PromoSettings {
  active: boolean;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  coverUrl: string;
  pdfPrice: number;
  pdfRegularPrice: number;
  printPrice: number;
  printRegularPrice: number;
  pdfDriveUrl: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber?: string;
  allowPrint: boolean;
}

export const defaultPromo: PromoSettings = {
  active: true,
  title: "SSC ও HSC শেষ মুহূর্তের স্পেশাল সাজেশন ও সমাধান",
  subtitle: "সম্পূর্ণ ১০০% নির্ভুল ও সহজ বাংলা ব্যাখ্যাসহ",
  description: "বোর্ড পরীক্ষায় সর্বোচ্চ কমন উপযোগী অধ্যায়ভিত্তিক চূড়ান্ত সাজেশন ও দ্রুত রিভিশন গাইড।",
  badge: "মেগা ছাড় অফার",
  coverUrl: "",
  pdfPrice: 120,
  pdfRegularPrice: 250,
  printPrice: 350,
  printRegularPrice: 500,
  pdfDriveUrl: "",
  bkashNumber: "017XXXXXXXX",
  nagadNumber: "018XXXXXXXX",
  rocketNumber: "019XXXXXXXX",
  allowPrint: true,
};

// 🎯 ডাটাবেজে টেবিল না থাকলে অটোমেটিক তৈরি করার সেফ ফাংশন
async function ensureSettingTable() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Setting" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL
    );
  `).catch(() => null);
}

// ১. সেটিংস ফেচ করা
export async function getPromoSettings(): Promise<PromoSettings> {
  try {
    await ensureSettingTable();
    const setting = await db.setting.findUnique({
      where: { key: "promo_book" },
    });
    if (!setting || !setting.value) return defaultPromo;
    return { ...defaultPromo, ...JSON.parse(setting.value) };
  } catch (err) {
    console.error("Error fetching promo settings:", err);
    return defaultPromo;
  }
}

// ২. সেটিংস সেভ করা
export async function savePromoSettings(data: PromoSettings) {
  try {
    await staff();
    await ensureSettingTable();

    await db.setting.upsert({
      where: { key: "promo_book" },
      update: { value: JSON.stringify(data) },
      create: { key: "promo_book", value: JSON.stringify(data) },
    });

    revalidatePath("/");
    revalidatePath("/admin/promo");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "সেভ করা সম্ভব হয়নি" };
  }
}
