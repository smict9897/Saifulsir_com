import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Saifulsir.com",
  description: "Disclaimer and legal terms for Saifulsir.com educational platform.",
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 font-sans text-gray-800 leading-relaxed">
      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Disclaimer</h1>
      <div className="space-y-1 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-300">
        <p><strong>Effective Date:</strong> October 15, 2026</p>
        <p><strong>Last Updated:</strong> October 15, 2026</p>
        <p>
          <strong>Website:</strong>{" "}
          <a href="https://saifulsir.com" className="text-blue-600 hover:underline">
            https://saifulsir.com
          </a>
        </p>
        <p>
          <strong>Contact:</strong>{" "}
          <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">
            support@saifulsir.com
          </a>
        </p>
      </div>

      <p className="mb-8">
        Welcome to <strong>Saifulsir.com – The Educational Platform</strong>. By accessing or using this website, you acknowledge that you have read, understood, and agreed to the terms set forth in this Disclaimer. If you do not agree with any part of this Disclaimer, please discontinue use of our website immediately.
      </p>

      <hr className="my-6 border-gray-300" />

      {/* Section 1 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">1. General Information Only</h2>
        <p>
          All content published on <strong>Saifulsir.com</strong> – including digital textbooks (PDFs), curriculum guides, study notes, academic tutorials, and online educational tools – is provided strictly for <strong>general educational and informational purposes only</strong>.
        </p>
        <p>
          While we make every reasonable effort to keep all information accurate, relevant, and updated in accordance with current educational curricula, we make <strong>no representations or warranties</strong> of any kind, express or implied, regarding the:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Absolute completeness or unerring accuracy of the learning materials</li>
          <li>Suitability of the information for any specific test or external evaluation</li>
          <li>Guaranteed academic results or exam scores resulting from the use of materials provided</li>
        </ul>
        <p>
          Saifulsir.com shall not be held liable for any typographical errors, omissions, or inaccuracies in the content, nor for any actions taken in reliance on the information provided on this website. Users are encouraged to verify information independently and consult official textbook editions or teachers when preparing for board examinations.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 2 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">2. No Professional or Certified Legal Advice</h2>
        <p>
          The materials available on Saifulsir.com are created solely for <strong>educational study assistance</strong> and do <strong>not</strong> constitute certified legal, financial, medical, or official academic accreditation.
        </p>
        <p>Nothing on this website should be interpreted as:</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>A formal substitute for registered school, college, or university instruction</li>
          <li>Certified legal counsel or binding regulatory guidance</li>
          <li>Professional career or financial advisory services</li>
        </ul>
        <p>
          If you require certified counseling or legal guidance specific to your personal or institutional circumstances, we strongly advise consulting an appropriately licensed authority in that field.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 3 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">3. External Links & Third-Party Services Disclaimer</h2>
        <p>
          Saifulsir.com may contain links to <strong>third-party educational websites</strong>, board portals, or reference sources for user convenience. These external links are provided in good faith to supplement the student learning experience.
        </p>
        <p>However, we explicitly clarify that:</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>We exercise <strong>no editorial or technical control</strong> over external third-party websites or services</li>
          <li>We are <strong>not responsible</strong> for the ongoing accuracy, privacy compliance, or security of external linked platforms</li>
          <li>The inclusion of an outbound link does <strong>not</strong> imply formal endorsement, sponsorship, or partnership unless expressly stated</li>
        </ul>
        <p>
          We strongly recommend reviewing the <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> and Terms of Use of any external website you visit. Saifulsir.com accepts no responsibility or liability for damages resulting from your interactions with external web destinations.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 4 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">4. Fair Use & Intellectual Property Notice</h2>
        <p>
          Saifulsir.com deeply respects <strong>intellectual property rights</strong>, author copyrights, and the work of educational publishers.
        </p>
        <p>
          Certain educational materials accessible on our platform – including textbook excerpts, board questions, and curriculum summaries – are shared under recognized <strong>Fair Use</strong> principles for non-profit educational evaluation and study support, in accordance with:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li><strong>Section 107 of the Copyright Act</strong> (Educational Fair Use doctrine)</li>
          <li><strong>Copyright Laws of Bangladesh</strong> governing non-profit educational research and study</li>
        </ul>
        <p>
          These materials are shared strictly for non-commercial educational study, commentary, and accessibility assistance for underprivileged learners.
        </p>

        <div className="bg-gray-100 border-l-4 border-blue-600 p-4 my-4 text-sm text-gray-700 rounded-r">
          <p>
            <strong>Notice to Copyright Holders:</strong> If you are a copyright owner or authorized agent and believe that content hosted on Saifulsir.com infringes upon your copyright, please consult our <Link href="/dmca" className="text-blue-600 hover:underline">DMCA Copyright Policy</Link> or contact us directly at <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>. We take copyright matters seriously and will investigate and act promptly.
          </p>
        </div>

        <p>
          All original articles, software calculators, formatting layouts, and branding elements produced by Saifulsir.com remain the exclusive intellectual property of Saifulsir.com and may not be republished without prior written authorization.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 5 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">5. Accuracy of Curriculum & Content Updates</h2>
        <p>While Saifulsir.com regularly reviews and updates its academic libraries, users should note that:</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>National curriculum boards (such as NCTB) periodically revise syllabi, chapter distributions, and textbook editions</li>
          <li>Archived questions or older model tests may reflect previous examination formats</li>
          <li>Third-party notes or shared submissions are provided on an &quot;as-is&quot; basis</li>
        </ul>
        <p>
          Students are encouraged to corroborate study guides with their official school or college syllabi prior to major board examinations.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 6 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">6. Affiliate & Advertising Disclosure</h2>
        <p>
          To support the ongoing operation of our digital servers and keep learning materials 100% free for all students, Saifulsir.com may display advertisements served by <strong>Google AdSense</strong> and ethical educational partners. Please be aware that:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Advertisements displayed on the platform are served automatically based on contextual relevance and user browsing preferences</li>
          <li>We may occasionally provide links to educational tools or study equipment through affiliate programs where a nominal commission may be earned at zero additional cost to you</li>
          <li>Advertiser relationships never dictate, compromise, or alter our educational review standards or resource selections</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 7 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">7. Consent to Terms of Disclaimer</h2>
        <p>
          By using and browsing <strong>Saifulsir.com</strong>, you signify your full acknowledgment of and agreement to all clauses set forth in this Disclaimer.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>You confirm that you have read and comprehended this document</li>
          <li>You use the resources provided on this website entirely at your own discretion and initiative</li>
          <li>You agree to hold Saifulsir.com, its management, and its editorial staff harmless from any indirect issues arising from your use of the website</li>
        </ul>
        <p>
          If you do not agree with any aspect of this Disclaimer, your remedy is to discontinue browsing our platform.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 8 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">8. Limitation of Liability</h2>
        <p>
          To the fullest extent permissible by applicable law, Saifulsir.com, its founder <strong>Saiful Islam</strong>, and its administrators shall <strong>not be liable</strong> for any direct, indirect, incidental, special, or consequential damages resulting from:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Your use of, or inability to use, our digital downloads, tools, or study resources</li>
          <li>Minor clerical errors, typos, or omissions within uploaded study notes</li>
          <li>Temporary site maintenance, server downtime, or download link interruptions</li>
          <li>Third-party websites, advertisements, or products linked from our pages</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 9 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">9. Revisions & Updates</h2>
        <p>
          Saifulsir.com reserves the right to revise, update, or amend this Disclaimer at any time without advance individual notification. Any modifications become effective immediately upon publication on this page.
        </p>
        <p>
          The &quot;Last Updated&quot; date at the top of this document indicates the latest review date. Continued use of our services following updates constitutes acceptance of the modified Disclaimer.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 10 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">10. Governing Law & Jurisdiction</h2>
        <p>
          This Disclaimer and all matters arising from website usage shall be governed by and construed in accordance with the laws of the <strong>People&apos;s Republic of Bangladesh</strong>. Any legal inquiries or disputes shall fall under the jurisdiction of the competent courts of Bangladesh.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 11 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">11. Contact Information</h2>
        <p>
          If you have any questions, suggestions, or legal inquiries concerning this Disclaimer, please contact us through our official communication channels:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li>📧 <strong>Official Email:</strong> <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a></li>
          <li>🌐 <strong>Official Website:</strong> <a href="https://saifulsir.com" className="text-blue-600 hover:underline">https://saifulsir.com</a></li>
          <li>📥 <strong>Contact Support Page:</strong> <Link href="/contact-us" className="text-blue-600 hover:underline">https://saifulsir.com/contact-us/</Link></li>
          <li>⏱️ <strong>Response Window:</strong> Inquiries are typically reviewed within 24 to 48 business hours.</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 12: Directory Table */}
      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold text-gray-900">12. Legal & Policy Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold">Policy Document</th>
                <th className="py-3 px-4 text-left font-semibold">Direct Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">🔒 Privacy Policy</td>
                <td className="py-3 px-4"><Link href="/privacy-policy" className="text-blue-600 hover:underline">saifulsir.com/privacy-policy/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">📜 Terms & Conditions</td>
                <td className="py-3 px-4"><Link href="/terms-conditions" className="text-blue-600 hover:underline">saifulsir.com/terms-conditions/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">🛡️ DMCA Copyright Policy</td>
                <td className="py-3 px-4"><Link href="/dmca" className="text-blue-600 hover:underline">saifulsir.com/dmca-policy/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">🍪 Cookie Policy</td>
                <td className="py-3 px-4"><Link href="/cookie-policy" className="text-blue-600 hover:underline">saifulsir.com/cookie-policy/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">👤 About Us</td>
                <td className="py-3 px-4"><Link href="/about-us" className="text-blue-600 hover:underline">saifulsir.com/about-us/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">✉️ Contact Us</td>
                <td className="py-3 px-4"><Link href="/contact-us" className="text-blue-600 hover:underline">saifulsir.com/contact-us/</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-center italic text-gray-600 mt-10">
        Thank you for making Saifulsir.com your companion in learning. We wish you every success in your academic pursuits.
      </p>
    </main>
  );
}
