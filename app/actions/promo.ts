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
  pdfDriveUrl: string; // পেমেন্ট কনফার্মের পর ছাত্র যে ড্রাইভ লিংক পাবে
  bkashNumber: string;
  nagadNumber: string;
  allowPrint: boolean; // প্রিন্ট কপি চালু বা বন্ধ রাখার টগল
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
  allowPrint: true,
};

// ১. সেটিংস ফেচ করা
export async function getPromoSettings(): Promise<PromoSettings> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: "promo_book" },
    });
    if (!setting) return defaultPromo;
    return { ...defaultPromo, ...JSON.parse(setting.value) };
  } catch (err) {
    console.error("Error fetching promo settings:", err);
    return defaultPromo;
  }
}

// ২. সেটিংস সেভ করা (শুধুমাত্র অ্যাডমিন পারবে)
export async function savePromoSettings(data: PromoSettings) {
  try {
    await staff();

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
