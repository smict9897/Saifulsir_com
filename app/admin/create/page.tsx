<form action="/api/upload" method="POST" encType="multipart/form-data" className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-1">পোস্টের শিরোনাম</label>
    <input type="text" name="title" className="w-full border rounded-lg p-2 text-sm" required />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">কভার ইমেজ (মোবাইল গ্যালারি থেকে)</label>
    {/* accept="image/*" দেওয়ার কারণে মোবাইলে সরাসরি ফটো গ্যালারি বা ক্যামেরা অপশন ওপেন হবে */}
    <input 
      type="file" 
      name="image" 
      accept="image/*" 
      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
    />
  </div>

  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
    পাবলিশ করুন
  </button>
</form>
