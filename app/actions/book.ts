"use server";

import { db } from "@/lib/db";
import { staff } from "@/lib/guard";
import { revalidatePath } from "next/cache";

// ডাটাবেজে রকমারি স্টাইল বইয়ের টেবিল তৈরি
async function ensureBookTable() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BookStore" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "title" TEXT NOT NULL,
      "author" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "coverUrl" TEXT NOT NULL,
      "pdfPrice" DOUBLE PRECISION NOT NULL,
      "pdfRegularPrice" DOUBLE PRECISION DEFAULT 0,
      "printPrice" DOUBLE PRECISION DEFAULT 0,
      "printRegularPrice" DOUBLE PRECISION DEFAULT 0,
      "pdfDriveUrl" TEXT NOT NULL,
      "samplePages" TEXT NOT NULL DEFAULT '[]',
      "description" TEXT,
      "specification" TEXT,
      "authorBio" TEXT,
      "rating" DOUBLE PRECISION DEFAULT 4.9,
      "reviewCount" INTEGER DEFAULT 25,
      "pageCount" INTEGER DEFAULT 120,
      "publisher" TEXT DEFAULT 'সাইফুল স্যার পাবলিকেশন্স',
      "edition" TEXT DEFAULT '২০২৬-২০২৭ নতুন সংস্করণ',
      "published" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => null);
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  pdfPrice: number;
  pdfRegularPrice?: number;
  printPrice?: number;
  printRegularPrice?: number;
  pdfDriveUrl: string;
  samplePages: string[];
  description?: string;
  specification?: string;
  authorBio?: string;
  rating?: number;
  reviewCount?: number;
  pageCount?: number;
  publisher?: string;
  edition?: string;
  isRecent?: boolean;
  published?: boolean;
}

// ১. ক্যাটালগ পেজের জন্য বই আনা (সার্চ ও ফিল্টার সহ)
export async function getBooksCatalog(category?: string, search?: string): Promise<BookItem[]> {
  try {
    await ensureBookTable();
    let query = `SELECT * FROM "BookStore" WHERE "published" = true`;
    const params: any[] = [];

    if (category && category !== "all") {
      params.push(`%${category}%`);
      query += ` AND "category" ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND ("title" ILIKE $${params.length} OR "author" ILIKE $${params.length})`;
    }

    query += ` ORDER BY "createdAt" DESC LIMIT 60;`;

    const rows: any = await db.$queryRawUnsafe(query, ...params);
    return (rows || []).map((b: any) => ({
      ...b,
      samplePages: typeof b.samplePages === "string" ? JSON.parse(b.samplePages) : (b.samplePages || []),
    }));
  } catch (err) {
    console.error("Catalog error:", err);
    return [];
  }
}

// 🎯 ২. অ্যাডমিন প্যানেলের জন্য সকল বই আনা (getAllBooks এক্সপোর্ট করা হলো)
export async function getAllBooks(): Promise<BookItem[]> {
  return getBooksCatalog();
}

// ৩. একক বইয়ের বিস্তারিত আনা (উভয় নামে এক্সপোর্ট)
export async function getBookDetails(id: string): Promise<BookItem | null> {
  try {
    await ensureBookTable();
    const rows: any = await db.$queryRawUnsafe(`SELECT * FROM "BookStore" WHERE "id" = $1 LIMIT 1;`, id);
    if (!rows || rows.length === 0) return null;
    const b = rows[0];
    return {
      ...b,
      samplePages: typeof b.samplePages === "string" ? JSON.parse(b.samplePages) : (b.samplePages || []),
    };
  } catch (err) {
    return null;
  }
}

export async function getBookById(id: string): Promise<BookItem | null> {
  return getBookDetails(id);
}

// ৪. অ্যাডমিন থেকে বই সংরক্ষণ করা
export async function saveBookToStore(data: Omit<BookItem, "id"> & { id?: string }) {
  try {
    await staff();
    await ensureBookTable();

    const samplePagesJson = JSON.stringify(data.samplePages || []);

    if (data.id) {
      await db.$executeRawUnsafe(
        `UPDATE "BookStore" SET 
          "title" = $1, "author" = $2, "category" = $3, "coverUrl" = $4,
          "pdfPrice" = $5, "pdfRegularPrice" = $6, "printPrice" = $7, "printRegularPrice" = $8,
          "pdfDriveUrl" = $9, "samplePages" = $10, "description" = $11, "pageCount" = $12,
          "publisher" = $13, "edition" = $14
         WHERE "id" = $15;`,
        data.title, data.author, data.category, data.coverUrl,
        Number(data.pdfPrice), Number(data.pdfRegularPrice || 0),
        Number(data.printPrice || 0), Number(data.printRegularPrice || 0),
        data.pdfDriveUrl, samplePagesJson, data.description || "",
        Number(data.pageCount || 120), data.publisher || "সাইফুল স্যার পাবলিকেশন্স",
        data.edition || "২০২৬-২০২৭ সংস্করণ", data.id
      );
    } else {
      await db.$executeRawUnsafe(
        `INSERT INTO "BookStore" (
          "id", "title", "author", "category", "coverUrl", "pdfPrice", 
          "pdfRegularPrice", "printPrice", "printRegularPrice", "pdfDriveUrl", 
          "samplePages", "description", "pageCount", "publisher", "edition"
        ) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
        data.title, data.author, data.category, data.coverUrl,
        Number(data.pdfPrice), Number(data.pdfRegularPrice || 0),
        Number(data.printPrice || 0), Number(data.printRegularPrice || 0),
        data.pdfDriveUrl, samplePagesJson, data.description || "",
        Number(data.pageCount || 120), data.publisher || "সাইফুল স্যার পাবলিকেশন্স",
        data.edition || "২০২৬-২০২৭ সংস্করণ"
      );
    }

    revalidatePath("/books");
    revalidatePath("/admin/books");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "সংরক্ষণ ব্যর্থ হয়েছে" };
  }
}
