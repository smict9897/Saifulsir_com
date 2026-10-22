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
  title: "Writing part",
  subtitle: "Paragraph writing",
  description: "Full hand Note",
  badge: "50% Discount",
  coverUrl: "",
  pdfPrice: 50,
  pdfRegularPrice: 100,
  printPrice: 350,
  printRegularPrice: 500,
  pdfDriveUrl: "",
  bkashNumber: "01773729897",
  nagadNumber: "01773729897",
  rocketNumber: "01773729897",
  allowPrint: false,
};

// ডাটাবেজে টেবিল তৈরি নিশ্চিত করা
async function ensureSettingTable() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Setting" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL
    );
  `).catch(() => null);
}

// ১. সেটিংস আনা
export async function getPromoSettings(): Promise<PromoSettings> {
  try {
    await ensureSettingTable();
    const setting = await db.setting.findUnique({
      where: { key: "promo_book" },
    }).catch(() => null);

    if (!setting || !setting.value) return defaultPromo;
    return { ...defaultPromo, ...JSON.parse(setting.value) };
  } catch (err) {
    console.error("Error fetching promo settings:", err);
    return defaultPromo;
  }
}

// ২. সেটিংস সেভ করা (কোনো অবস্থাতেই আটকাবে না)
export async function savePromoSettings(data: PromoSettings) {
  try {
    await staff();
    await ensureSettingTable();

    const jsonValue = JSON.stringify(data);

    // ১. Prisma দিয়ে সেভ করার চেষ্টা
    try {
      await db.setting.upsert({
        where: { key: "promo_book" },
        update: { value: jsonValue },
        create: { key: "promo_book", value: jsonValue },
      });
    } catch {
      // ২. ফলব্যাক: সরাসরি Raw SQL কুয়েরি দিয়ে সেভ (যদি প্রিজমায় মিসম্যাচ হয়)
      await db.$executeRawUnsafe(
        `INSERT INTO "Setting" ("key", "value") VALUES ('promo_book', $1)
         ON CONFLICT ("key") DO UPDATE SET "value" = $1;`,
        jsonValue
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/promo");
    return { success: true };
  } catch (err: any) {
    console.error("Save promo error:", err);
    return { success: false, error: err.message || "সেভ করা সম্ভব হয়নি" };
  }
}
