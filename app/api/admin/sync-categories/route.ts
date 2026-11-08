import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NCTB_CLASSES, EXAM_PREPARATION } from "@/lib/nctb-data";
import { auth } from "@/auth";

function createSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type TreeNode = {
  name: string;
  slug: string;
  subcategories?: TreeNode[];
};

// গাছের মতো ক্যাটাগরি (subcategories) রিকার্সিভভাবে সিঙ্ক করে
async function syncTree(node: TreeNode, parentId: string | null, parentSlug: string | null): Promise<number> {
  const slug = parentSlug ? `${parentSlug}-${node.slug}` : node.slug;

  const category = await db.category.upsert({
    where: { slug },
    update: { name: node.name, parentId },
    create: { name: node.name, slug, parentId },
  });

  let count = 1;
  for (const child of node.subcategories ?? []) {
    count += await syncTree(child, category.id, slug);
  }
  return count;
}

export async function GET() {
  const role = (await auth())?.user?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    let count = 0;

    // ১. ক্লাস ও বিষয়
    for (const classData of NCTB_CLASSES) {
      const classSlug = createSlug(classData.class);
      const parentCategory = await db.category.upsert({
        where: { slug: classSlug },
        update: {},
        create: {
          name: classData.class,
          slug: classSlug,
          parentId: null,
        },
      });

      for (const subject of classData.subjects) {
        const subjectSlug = `${classSlug}-${createSlug(subject.name)}`;
        await db.category.upsert({
          where: { slug: subjectSlug },
          update: {},
          create: {
            name: subject.name,
            slug: subjectSlug,
            parentId: parentCategory.id,
          },
        });
        count++;
      }
    }

    // ২. প্রস্তুতি ও সহায়িকা
    count += await syncTree(EXAM_PREPARATION as TreeNode, null, null);

    return NextResponse.json({ ok: true, message: `${count} টি ক্যাটাগরি সফলভাবে যুক্ত হয়েছে।` });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
