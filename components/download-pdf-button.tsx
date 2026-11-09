"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";

export default function DownloadPdfButton({ contentId, fileName }: { contentId: string; fileName: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(contentId);
    if (!element) return;

    setLoading(true);
    
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin:       [10, 10, 10, 10], 
        filename:     `${fileName.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, "_")}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 3, 
          useCORS: true, 
          letterRendering: true,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { 
          mode: ['css', 'legacy'], 
          avoid: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th', 'ul', 'ol', 'li', 'article', 'div'] 
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center sm:items-start gap-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className={`group relative inline-flex items-center gap-3 rounded-2xl px-8 py-3 text-white shadow-[0_8px_15px_rgba(0,0,0,0.3)] transition-all duration-300 border-t ${
          loading 
            ? "bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border-slate-500 cursor-not-allowed" 
            : "bg-gradient-to-b from-blue-400 via-blue-600 to-blue-900 border-blue-300 hover:shadow-[0_12px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1"
        }`}
      >
        {/* 3D ইফেক্টের জন্য ভেতরের শ্যাডো */}
        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {loading ? (
          <Loader2 size={24} className="animate-spin text-white" />
        ) : (
          <Download size={24} className="text-white drop-shadow-md" />
        )}
        
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-bold tracking-widest uppercase drop-shadow-sm opacity-90">
            {loading ? "Processing..." : "Download"}
          </span>
          <span className="text-xl font-black tracking-wide drop-shadow-md">
            {loading ? "PDF তৈরি হচ্ছে" : "HERE"}
          </span>
        </div>

        {/* গ্লোয়িং এফেক্ট (শুধু লোডিংয়ের সময়) */}
        {loading && (
          <span className="absolute inset-0 rounded-2xl animate-ping bg-blue-400 opacity-20 pointer-events-none" style={{ animationDuration: '2s' }}></span>
        )}
      </button>

      {/* সুন্দর মেসেজ (শুধু লোডিংয়ের সময় দেখা যাবে) */}
      {loading && (
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 animate-pulse">
          <FileText size={16} />
          <span>আপনার PDF তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
        </div>
      )}
    </div>
  );
}
