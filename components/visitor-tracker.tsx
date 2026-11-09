"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;

    // একই পেজে বারবার ট্র্যাক করব না
    if (lastTrackedRef.current === pathname) return;

    // Admin প্যানেল বা অ্যাপের ইন্টারনাল রুটে ট্র্যাকিং লাগবে না (ইচ্ছে করলে বাদ দিতে পারেন)
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // sessionStorage দিয়ে একই ট্যাবে একবারের বেশি কাউন্ট আটকাই
    const key = `visited:${pathname}`;
    if (sessionStorage.getItem(key)) {
      lastTrackedRef.current = pathname;
      return;
    }

    // পেজ লোড হওয়ার ৩ সেকেন্ড পরে পাঠাই যাতে বট ফাঁকি যায়
    const timer = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      })
        .then(() => {
          sessionStorage.setItem(key, "1");
          lastTrackedRef.current = pathname;
        })
        .catch((e) => {
          console.error("Track failed:", e);
        });
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
