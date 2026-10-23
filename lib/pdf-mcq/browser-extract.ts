export async function extractCleanTwoColumnPdf(file: File): Promise<string> {
  if (typeof window === "undefined") return "";

  const pdfjsLib: any = await new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) return resolve((window as any).pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(lib);
    };
    script.onerror = () => reject(new Error("PDF.js লোড হয়নি"));
    document.head.appendChild(script);
  });

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const midX = viewport.width / 2;

    const col1Items: any[] = [];
    const col2Items: any[] = [];

    textContent.items.forEach((item: any) => {
      if (item.transform[4] < midX - 5) col1Items.push(item);
      else col2Items.push(item);
    });

    const buildCol = (items: any[]) => {
      if (!items.length) return "";
      items.sort((a, b) => b.transform[5] - a.transform[5]);
      let res = items[0].str;
      let currentY = items[0].transform[5];
      let lastXEnd = items[0].transform[4] + items[0].width;

      for (let i = 1; i < items.length; i++) {
        const it = items[i];
        const y = it.transform[5];
        const x = it.transform[4];
        if (Math.abs(y - currentY) > 5) {
          res += "\n" + it.str;
          currentY = y;
          lastXEnd = x + it.width;
        } else {
          res += (x - lastXEnd > 4 ? " " : "") + it.str;
          lastXEnd = Math.max(lastXEnd, x + it.width);
        }
      }
      return res;
    };

    fullText += `\n${buildCol(col1Items)}\n\n${buildCol(col2Items)}\n`;
  }

  return fullText;
}
