import Image from "next/image";

const img = /^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/;
const blob = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//;

export default function PostBody({ body }: { body: string }) {
  return (
    <div className="mt-6 grid gap-4 leading-relaxed">
      {body.split(/\n{2,}/).map((raw, i) => {
        const t = raw.trim();
        const m = t.match(img);
        if (m && blob.test(m[2])) {
          return <Image key={i} src={m[2]} alt={m[1]} width={1200} height={800} sizes="(max-width: 768px) 100vw, 672px" className="h-auto w-full rounded-2xl" />;
        }
        if (m) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={i} src={m[2]} alt={m[1]} loading="lazy" className="h-auto w-full rounded-2xl" />;
        }
        if (t.startsWith("### ")) return <h3 key={i} className="mt-2 text-xl font-bold">{t.slice(4)}</h3>;
        if (t.startsWith("## ")) return <h2 key={i} className="mt-4 text-2xl font-bold">{t.slice(3)}</h2>;
        return <p key={i} className="whitespace-pre-line">{t}</p>;
      })}
    </div>
  );
}
