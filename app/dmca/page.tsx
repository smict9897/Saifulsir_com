import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DMCA Copyright Policy | SaifulSir.com",
  description: "DMCA Copyright Policy and takedown notification guidelines for SaifulSir.com.",
};

export default function DMCAPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">DMCA Copyright Policy</span>
        </nav>

        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            DMCA Copyright Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Policy Notice Box */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            DMCA Copyright Policy of SaifulSir.com
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            At <strong>SaifulSir.com</strong>, we respect the intellectual property rights of others and are committed to complying with the Digital Millennium Copyright Act (DMCA). This policy outlines how we handle copyright infringement notices and the process for reporting suspected copyright violations on our website,{" "}
            <a href="https://saifulsir.com" className="text-blue-600 hover:underline font-medium">
              https://saifulsir.com
            </a>.
          </p>
        </div>

        {/* 1. Copyright Infringement Notification */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Copyright Infringement Notification
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            If you believe that any content on our website infringes your copyright, you can submit a DMCA takedown notice by providing the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
            <li>A physical or electronic signature of the copyright owner or a person authorized to act on behalf of the owner.</li>
            <li>Identification of the copyrighted work that you claim has been infringed.</li>
            <li>Identification of the content on our website that you believe is infringing and the exact URL(s) of the content.</li>
            <li>Your name, address, phone number, and email address where we can contact you.</li>
            <li>A statement that you have a good faith belief that the use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement, under penalty of perjury, that the information in your notification is accurate, and that you are the copyright owner or authorized to act on the owner's behalf.</li>
          </ul>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-slate-700">
            <strong>Please send your DMCA takedown notice to us at:</strong>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Email:</strong> <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a></li>
              <li>• <strong>Contact Page:</strong> <Link href="/contact" className="text-blue-600 hover:underline">https://saifulsir.com/contact</Link></li>
            </ul>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* 2. Counter-Notice */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Counter-Notice
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            If you believe that your content was removed in error or you have the right to use the material under the law, you can submit a counter-notice. To file a counter-notice, please provide the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
            <li>Your physical or electronic signature.</li>
            <li>Identification of the material that was removed and the URL where the material appeared before it was removed.</li>
            <li>A statement under penalty of perjury that you have a good faith belief that the content was removed as a result of mistake or misidentification.</li>
            <li>Your name, address, phone number, and email address.</li>
            <li>A statement consenting to the jurisdiction of the relevant legal authority where your address is located or where the website operates.</li>
          </ul>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-slate-700">
            <strong>Please send your counter-notice to:</strong>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Email:</strong> <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a></li>
              <li>• <strong>Contact Page:</strong> <Link href="/contact" className="text-blue-600 hover:underline">https://saifulsir.com/contact</Link></li>
            </ul>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* 3. Content Ownership and Usage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Content Ownership and Usage
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            All educational content published on <strong>SaifulSir.com</strong> is either owned by us or licensed from third parties. We strive to ensure that the content we use complies with all copyright laws. However, if you believe any content on our website violates your copyright, please follow the steps outlined above to notify us immediately.
          </p>
        </section>

        {/* 4. Changes to This Policy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Changes to This Policy
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            We may update our DMCA Copyright Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. Please review this policy periodically to stay informed about how we handle copyright infringement issues.
          </p>
        </section>

        {/* 5. Contact Us */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Contact Us
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            If you have any questions or concerns about this DMCA policy or need to submit a notice, please reach out via:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-1">
            <p>• <strong>Email:</strong> <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a></p>
            <p>• <strong>Contact Page:</strong> <Link href="/contact" className="text-blue-600 hover:underline">https://saifulsir.com/contact</Link></p>
          </div>
        </section>

      </div>
    </main>
  );
}
