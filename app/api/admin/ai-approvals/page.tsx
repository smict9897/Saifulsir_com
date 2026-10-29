import AdminAIApprovals from "@/components/admin-ai-approvals";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "AI Question Approvals" };

export default function AIApprovalsPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">AI Question Approvals</h1>
      </div>
      <AdminAIApprovals />
    </div>
  );
}
