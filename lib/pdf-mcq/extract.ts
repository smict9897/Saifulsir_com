export async function extractText(buffer: ArrayBuffer): Promise<string> {
  // Render বা Vercel বিল্ডে test/data ফাইল খোঁজার ENOENT এরর এড়াতে সরাসরি লাইব্রেরি ফাইল ইমপোর্ট
  let pdfParse: any;
  try {
    // @ts-ignore
    pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default || (await import("pdf-parse/lib/pdf-parse.js"));
  } catch {
    // @ts-ignore
    pdfParse = (await import("pdf-parse")).default || (await import("pdf-parse"));
  }

  const result = await pdfParse(Buffer.from(buffer));
  return result.text ?? "";
}
