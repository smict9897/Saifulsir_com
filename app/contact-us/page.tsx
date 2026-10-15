import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Saifulsir.com",
  description: "Get in touch with Saifulsir.com educational platform team for queries, support, feedback, and partnerships.",
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 font-sans text-gray-800 leading-relaxed">
      {/* Top Breadcrumb & Header */}
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Home</Link> / Contact Us
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Contact Us</h1>
      <p className="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-300">
        <strong>Website:</strong>{" "}
        <a href="https://saifulsir.com" className="text-blue-600 hover:underline">
          https://saifulsir.com
        </a>{" "}
        | <strong>Email:</strong>{" "}
        <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">
          support@saifulsir.com
        </a>
      </p>

      {/* Intro Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">We&apos;d Love to Hear From You!</h2>
        <p className="mb-4">
          At <strong>Saifulsir.com – The Educational Platform</strong>, we value every message, suggestion, and inquiry from our students, educators, and visitors. Whether you have a question about our educational materials, a technical issue, a copyright concern, or simply want to share your feedback – our team is here to support you.
        </p>
        <p>
          Please read through the sections below to find the most direct way to get in touch with our team.
        </p>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 1: General Contact Information */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">1. General Contact Information</h2>
        <p>
          For all general inquiries, platform feedback, and communication, please reach out through the official channels below:
        </p>

        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse bg-white border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold">Channel</th>
                <th className="py-3 px-4 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 font-medium">📧 Official Email</td>
                <td className="py-3 px-4">
                  <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">
                    support@saifulsir.com
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">🌐 Official Website</td>
                <td className="py-3 px-4">
                  <a href="https://saifulsir.com" className="text-blue-600 hover:underline">
                    https://saifulsir.com/
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">👤 Founder & Lead</td>
                <td className="py-3 px-4">Saiful Islam</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">📍 Location</td>
                <td className="py-3 px-4">Bangladesh (Serving Students Nationwide & Globally)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 my-4 italic text-sm text-gray-700 rounded-r">
          We aim to respond to all inquiries within <strong>24–48 hours</strong> on business days. Please allow additional time during major board examination periods or public holidays.
        </div>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 2: Contact by Department */}
      <section className="space-y-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900">2. Contact by Department</h2>
        <p>
          To help us direct your message to the right person and resolve it faster, please select the appropriate subject line for your email:
        </p>

        {/* 2.1 Content & Educational Resources */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📚 Content & Educational Resources
          </h3>
          <p className="text-sm">
            For textbook requests, syllabus questions, study notes, or suggestions for new educational materials:
          </p>
          <p className="text-sm">
            📧 <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>
          </p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800">
            <strong>Subject Line:</strong><br />
            Content Request – [Your Class / Subject / Topic]
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 2.2 Copyright & DMCA Notices */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🛡️ Copyright & DMCA Notices
          </h3>
          <p className="text-sm">
            If you are a copyright owner and believe content on our platform infringes your copyright, please submit a formal takedown notice. Before emailing, please review our{" "}
            <Link href="/dmca" className="text-blue-600 hover:underline">DMCA Copyright Policy</Link> for required details.
          </p>
          <p className="text-sm">
            📧 <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>
          </p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800">
            <strong>Subject Line:</strong><br />
            DMCA Takedown Notice – [Content Title or URL]
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 2.3 Technical Issues & Bug Reports */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🐛 Technical Issues & Bug Reports
          </h3>
          <p className="text-sm">
            Experiencing a broken download link, PDF preview error, or display issue on our website? Let us know so our technical team can resolve it immediately.
          </p>
          <p className="text-sm">
            📧 <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>
          </p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800">
            <strong>Subject Line:</strong><br />
            Technical Issue – [Page URL or Brief Description]
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 2.4 Advertising & Sponsorship */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📢 Advertising & Sponsorship
          </h3>
          <p className="text-sm">
            Interested in promoting educational programs, academic tools, or learning products to our audience of students and teachers across Bangladesh?
          </p>
          <p className="text-sm">
            📧 <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>
          </p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800">
            <strong>Subject Line:</strong><br />
            Advertising Inquiry – [Your Brand or Organization Name]
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 2.5 Partnership & Collaboration */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🤝 Partnership & Collaboration
          </h3>
          <p className="text-sm">
            Are you an educational institution, writer, publisher, or non-profit organization interested in collaborating with us to expand free education?
          </p>
          <p className="text-sm">
            📧 <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>
          </p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800">
            <strong>Subject Line:</strong><br />
            Partnership Proposal – [Your Organization Name]
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* 2.6 Privacy & Data Inquiries */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🔒 Privacy & Data Inquiries
          </h3>
          <p className="text-sm">
            For questions regarding your personal privacy, cookie consent, or data rights as detailed in our{" "}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>:
          </p>
          <p className="text-sm">
            📧 <a href="mailto:support@saifulsir.com" className="text-blue-600 hover:underline">support@saifulsir.com</a>
          </p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800">
            <strong>Subject Line:</strong><br />
            Privacy Inquiry – [Brief Description]
          </div>
        </div>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 3: Before You Contact Us */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">3. Before You Contact Us</h2>
        <p>
          To save you time, please check these helpful resource pages – your question may already be answered:
        </p>

        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse bg-white border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold">Your Common Question</th>
                <th className="py-3 px-4 text-left font-semibold">Helpful Direct Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">How do I download textbooks or notes?</td>
                <td className="py-3 px-4">Browse our category archives and subject pages directly</td>
              </tr>
              <tr>
                <td className="py-3 px-4">What is your copyright and takedown policy?</td>
                <td className="py-3 px-4"><Link href="/dmca" className="text-blue-600 hover:underline">DMCA Copyright Policy</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">How do you protect visitor privacy and data?</td>
                <td className="py-3 px-4"><Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">What are the terms of using this platform?</td>
                <td className="py-3 px-4"><Link href="/terms-conditions" className="text-blue-600 hover:underline">Terms & Conditions</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">How are cookies utilized on this site?</td>
                <td className="py-3 px-4"><Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4">Who founded and manages this website?</td>
                <td className="py-3 px-4"><Link href="/about-us" className="text-blue-600 hover:underline">About Us</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 4: Tips for a Faster Response */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">4. Tips for a Faster Response</h2>
        <p>
          When sending an email, including the following information will help us assist you efficiently:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Your <strong>Name</strong> or preferred title</li>
          <li>✅ A <strong>descriptive subject line</strong> matching your topic</li>
          <li>✅ The exact <strong>Page URL</strong> if referring to a specific book, article, or tool</li>
          <li>✅ A <strong>screenshot or error message</strong> if reporting a technical bug</li>
          <li>✅ Your preferred language – we respond in both <strong>বাংলা</strong> and <strong>English</strong></li>
        </ul>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 5: Response Time Policy */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">5. Response Time Policy</h2>

        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse bg-white border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold">Inquiry Department</th>
                <th className="py-3 px-4 text-left font-semibold">Expected Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">General Questions & Student Inquiries</td>
                <td className="py-3 px-4">24–48 hours</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Technical Bugs & Broken Links</td>
                <td className="py-3 px-4">12–24 hours</td>
              </tr>
              <tr>
                <td className="py-3 px-4">DMCA & Copyright Notices</td>
                <td className="py-3 px-4">24–48 hours (investigation initiated promptly)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Partnership & Advertising</td>
                <td className="py-3 px-4">2–3 business days</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Privacy & Data Subject Requests</td>
                <td className="py-3 px-4">Within 30 calendar days (GDPR / CCPA standard)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 my-4 italic text-sm text-gray-700 rounded-r">
          Please note: Email is our official and verified support channel. We do not provide phone support for academic inquiries.
        </div>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 6: Stay Connected */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">6. Stay Connected</h2>
        <p>
          Stay up to date with new educational releases, textbooks, and platform features through our official community channels:
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            🌐 <strong>Website:</strong> Bookmark <a href="https://saifulsir.com" className="text-blue-600 hover:underline">https://saifulsir.com/</a> for routine study updates
          </li>
          <li>
            📢 <strong>Telegram Channel:</strong> Join our student community on <a href="#" className="text-blue-600 hover:underline">Telegram (@saifulsir)</a>
          </li>
          <li>
            📺 <strong>YouTube Channel:</strong> Watch educational tutorials on <a href="#" className="text-blue-600 hover:underline">YouTube (@saifulsir)</a>
          </li>
          <li>
            👥 <strong>Facebook Page:</strong> Connect with us on <a href="#" className="text-blue-600 hover:underline">Facebook (@saifulsir)</a>
          </li>
        </ul>
      </section>

      <hr className="my-8 border-gray-300" />

      {/* Section 7: Platform Location & Reach */}
      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-bold text-gray-900">7. Platform Location & Reach</h2>
        <p>
          Saifulsir.com operates digitally from Bangladesh, serving students, teachers, and curious minds across all 64 districts as well as Bangladeshi diaspora students worldwide.
        </p>
        <div className="text-sm font-medium text-gray-800 space-y-1">
          <p>🇧🇩 <strong>Operating Location:</strong> Bangladesh</p>
          <p>🌍 <strong>Serving:</strong> Learners Nationwide & Worldwide</p>
        </div>
      </section>
    </main>
  );
    }
