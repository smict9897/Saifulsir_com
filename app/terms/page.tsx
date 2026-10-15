import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms Conditions | Saifulsir.com",
  description: "Terms and Conditions governing the use of Saifulsir.com educational platform, digital textbooks, and resources.",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 font-sans text-gray-800 leading-relaxed">
      {/* Breadcrumb & Header */}
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Home</Link> / Terms Conditions
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Terms Conditions</h1>
      
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

      <p className="mb-4">
        Welcome to <strong>Saifulsir.com – The Educational Platform</strong>. These Terms &amp; Conditions govern your use of our website, applications, digital textbooks, and all educational services provided through our platform. Please review these terms carefully before accessing our materials.
      </p>

      <p className="mb-8">
        By accessing, browsing, or using Saifulsir.com, you confirm that you are at least <strong>13 years of age</strong> (or possess parental/guardian consent), have read and understood these Terms, and agree to be legally bound by them. If you do not agree to these terms, please discontinue use of our website immediately.
      </p>

      <hr className="my-6 border-gray-300" />

      {/* Section 1 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms &amp; Ownership</h2>
        <p>
          By using any portion of Saifulsir.com, you enter into a legally binding agreement with <strong>Saiful Islam</strong> (the &quot;Owner&quot; and Founder) and agree to comply with all terms, conditions, and applicable local and international laws. These Terms apply uniformly to all learners, educators, and visitors (&quot;Users&quot;).
        </p>
        <p>
          We reserve the right to revise or update these Terms at our discretion. Continued use of Saifulsir.com after updates are published signifies your acceptance of the revised Terms.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 2 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">2. Scope &amp; Description of Educational Services</h2>
        <p>Saifulsir.com is an open digital educational repository that provides:</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Digital textbooks, question papers, and downloadable syllabus PDFs</li>
          <li>Comprehensive study notes, suggestions, and academic summaries</li>
          <li>Islamic educational references, moral literature, and scholarly articles</li>
          <li>Subject-specific guides spanning science, mathematics, literature, and ICT</li>
          <li>Interactive web utilities (GPA/CGPA calculators, image and exam photo formatting tools)</li>
        </ul>
        <p>
          All resources provided through Saifulsir.com are dedicated strictly to <strong>personal, non-commercial, and educational study</strong>.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 3 */}
      <section className="space-y-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900">3. Intellectual Property Rights &amp; Content Licensing</h2>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">3.1 Saifulsir.com Original Content</h3>
          <p>
            All original content published on Saifulsir.com – including articles, website layouts, custom graphics, brand identity, user interface styling, and interactive web tools – constitutes the <strong>exclusive intellectual property of Saifulsir.com</strong> and is protected under national and international copyright statutes.
          </p>
          <p>
            You may <strong>not</strong> scrape, reproduce, sell, sublicense, or commercially exploit any proprietary code or original writings from this website without explicit prior written authorization.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">3.2 Educational Materials &amp; Fair Use</h3>
          <p>
            Certain educational materials (such as curriculum books or board question references) are organized for non-profit study assistance under the recognized doctrine of <strong>Fair Use</strong>. We respect the intellectual property of original publishers and maintain a dedicated takedown process as outlined in our <Link href="/dmca" className="text-blue-600 hover:underline">DMCA Policy</Link>.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">3.3 User Submissions &amp; Comments</h3>
          <p>
            If you submit comments, academic feedback, or community suggestions to our platform, you grant Saifulsir.com a non-exclusive, perpetual, royalty-free license to publish, display, and review that content in furtherance of our educational mission.
          </p>
        </div>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 4 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">4. Permitted Student &amp; Teacher Uses</h2>
        <p>
          You agree to use Saifulsir.com exclusively for lawful and ethical educational purposes. You are welcome to:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Access, read, and bookmark study resources for your personal academic revision</li>
          <li>✅ Download available textbook PDFs and notes for personal offline study</li>
          <li>✅ Share webpage links with fellow students, study circles, and classrooms</li>
          <li>✅ Print physical copies for individual personal learning and exam preparation</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 5 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">5. Prohibited Activities &amp; Platform Security</h2>
        <p>
          To preserve platform integrity and ensure equitable access for all learners, users are strictly prohibited from:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>❌ Deploying automated crawlers, scrapers, data-mining scripts, or bots to harvest bulk content</li>
          <li>❌ Attempting to circumvent server firewalls, exploit vulnerabilities, or disrupt infrastructure</li>
          <li>❌ Transmitting malware, malicious links, worms, or disruptive code</li>
          <li>❌ Repackaging, selling, or charging fees for resources obtained freely from Saifulsir.com</li>
          <li>❌ Impersonating the website owner, administrative staff, or educators</li>
          <li>❌ Engaging in abusive conduct, spamming comment sections, or violating the legal rights of others</li>
        </ul>
        <p className="mt-4 text-sm font-medium text-red-600">
          Violators will face immediate IP blocking, revocation of platform privileges, and, where applicable, referral to relevant law enforcement bodies.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 6 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">6. External Links &amp; Third-Party Services</h2>
        <p>
          Saifulsir.com may reference links to official educational boards, universities, or external services. These links are provided solely as academic references. We disclaim any liability for:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>The availability, accuracy, or integrity of external web destinations</li>
          <li>The independent privacy policies or terms enforced by third-party platforms</li>
          <li>Any loss or consequence resulting from your interactions on external websites</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 7 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">7. Advertising &amp; Affiliate Disclosure</h2>
        <p>
          Saifulsir.com is monetized in part through digital advertising served by <strong>Google AdSense</strong> and legitimate academic sponsors. As such:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Advertisements displayed help subsidize high-bandwidth server hosting and development costs</li>
          <li>Advertising partners deploy cookies to serve contextually relevant advertisements in accordance with Google Publisher Policies</li>
          <li>Editorial content and academic resource selections remain independent of commercial sponsorships</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 8 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">8. Disclaimer of Warranties</h2>
        <p>
          Saifulsir.com is provided on an <strong>&quot;as-is&quot;</strong> and <strong>&quot;as-available&quot;</strong> basis. To the fullest extent permissible by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular academic purpose, and non-infringement. We do not guarantee that the site will operate uninterrupted or error-free at all times.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 9 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, <strong>Saifulsir.com, its founder Saiful Islam, and its contributors</strong> shall not be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from your use of or inability to access the website or its content.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 10 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">10. Child Privacy &amp; Minor Protection</h2>
        <p>
          Saifulsir.com complies with student privacy guidelines and does not knowingly collect personal identifiable information from children under 13 without verifiable parental/guardian consent.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 11 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">11. Privacy &amp; Data Handling</h2>
        <p>
          Your use of our platform is also governed by our comprehensive <strong>Privacy Policy</strong>, which is incorporated into these Terms by reference. Please review our data protection practices at:{" "}
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">
            https://saifulsir.com/privacy-policy/
          </Link>
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 12 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">12. Copyright Infringement &amp; DMCA Compliance</h2>
        <p>
          We take copyright concerns seriously. To report an alleged infringement, review our formal procedure on the{" "}
          <Link href="/dmca" className="text-blue-600 hover:underline">DMCA Policy page</Link> or submit a notice to our designated contact at{" "}
          <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">
            support@saifulsir.com
          </a>.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 13 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">13. Termination of Access</h2>
        <p>
          We reserve the right to temporarily suspend or permanently terminate access to Saifulsir.com at our sole discretion, without prior notice, if a user breaches these Terms &amp; Conditions or engages in harmful, malicious conduct.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 14 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">14. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of the <strong>People&apos;s Republic of Bangladesh</strong>. Any disputes arising in connection with these Terms shall fall under the exclusive jurisdiction of the competent courts of Bangladesh.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 15 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">15. Severability &amp; Entire Agreement</h2>
        <p>
          If any provision of these Terms is deemed unlawful, invalid, or unenforceable, that provision shall be severed without affecting the validity and enforceability of the remaining provisions. These Terms, alongside our Privacy Policy, Cookie Policy, and Disclaimer, constitute the entire agreement between you and Saifulsir.com.
        </p>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 16 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">16. Contact Information</h2>
        <p>
          For any questions, legal notices, or feedback regarding these Terms &amp; Conditions, please contact us:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li>📧 <strong>Official Email:</strong> <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a></li>
          <li>🌐 <strong>Official Website:</strong> <a href="https://saifulsir.com" className="text-blue-600 hover:underline">https://saifulsir.com/</a></li>
          <li>📥 <strong>Contact Form:</strong> <Link href="/contact-us" className="text-blue-600 hover:underline">https://saifulsir.com/contact-us/</Link></li>
          <li>⏱️ <strong>Response Window:</strong> We review all inquiries within 24 to 48 business hours.</li>
        </ul>
      </section>

      <hr className="my-6 border-gray-300" />

      {/* Section 17: Legal & Policy Directory Table */}
      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold text-gray-900">17. Legal &amp; Policy Directory</h2>
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
                <td className="py-3 px-4">⚠️ Disclaimer</td>
                <td className="py-3 px-4"><Link href="/disclaimer" className="text-blue-600 hover:underline">saifulsir.com/disclaimer/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">📜 Terms &amp; Conditions</td>
                <td className="py-3 px-4"><Link href="/terms-conditions" className="text-blue-600 hover:underline">saifulsir.com/terms-conditions/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">🍪 Cookie Policy</td>
                <td className="py-3 px-4"><Link href="/cookie-policy" className="text-blue-600 hover:underline">saifulsir.com/cookie-policy/</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">🛡️ DMCA Copyright Policy</td>
                <td className="py-3 px-4"><Link href="/dmca" className="text-blue-600 hover:underline">saifulsir.com/dmca-policy/</Link></td>
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
        Thank you for respecting our community standards and choosing Saifulsir.com for your educational journey.
      </p>
    </main>
  );
}
