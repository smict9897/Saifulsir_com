"use client";
import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login, register, googleLogin } from "@/app/actions/auth";

const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2";

function LoginInner() {
  const next = useSearchParams().get("next") ?? "";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, action, pending] = useActionState(mode === "login" ? login : register, "");
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Log in" : "Create account"}</h1>
      <form action={googleLogin} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 font-medium">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
          Continue with Google
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">or use email</p>
      <form action={action} className="mt-4 grid gap-3">
        <input type="hidden" name="next" value={next} />
        {mode === "register" && <input name="name" className={field} placeholder="Full name" required />}
        <input name="email" type="email" className={field} placeholder="Email" required />
        <input name="password" type="password" minLength={8} className={field} placeholder="Password (8+ characters)" required />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button disabled={pending} className="rounded-md bg-royal px-4 py-2.5 font-medium text-white disabled:opacity-60">
          {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="mt-4 text-sm text-royal">
        {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
      </button>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
