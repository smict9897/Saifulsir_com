import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | SaifulSir.com',
  description: 'Learn more about SaifulSir.com, our mission, vision, and the team behind Bangladesh\'s dedicated educational portal.',
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">About Us</span>
        </nav>

        {/* Page Title */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About Us
          </h1>
          <p className="mt-2 text-base text-slate-600">
            <strong>Website:</strong>{' '}
            <a href="https://saifulsir.com" className="text-blue-600 hover:underline">
              https://saifulsir.com
            </a>{' '}
            | <strong>Email:</strong>{' '}
            <a href="mailto:admin@saifulsir.com" className="text-blue-600 hover:underline">
              admin@saifulsir.com
            </a>
          </p>
        </div>

        {/* Hero Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome to SaifulSir.com!
          </h2>
          <p className="text-slate-700 leading-relaxed">
            At <strong>SaifulSir.com – Educational Platform</strong>, we are dedicated to empowering students, educators, and lifelong learners across Bangladesh with high-quality, accessible, and structured educational resources. Whether you are looking for chapter-wise study notes, ICT guide materials, board exam suggestions, or digital learning tools — our platform is built to support your academic journey every step of the way.
          </p>
        </section>

        <hr className="border-slate-200" />

        {/* 1. Platform Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            1. Platform Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Feature</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium">🌐 Official Website</td>
                  <td className="p-3 text-blue-600">https://saifulsir.com/</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">👤 Founder & Lead Educator</td>
                  <td className="p-3">Saiful Islam (Assistant Teacher - ICT)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">📍 Operating Location</td>
                  <td className="p-3">Hobiganj, Bangladesh (Serving Students Nationwide)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">🎯 Primary Focus</td>
                  <td className="p-3">ICT & Computer Science Education, Board Exam Materials & Digital Learning Tools</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Mission & Vision */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            2. Our Mission & Vision
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-xl font-bold text-blue-700">🚀 Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To simplify complex educational concepts, provide free and structured study materials, and bridge the digital divide for students across all 64 districts in Bangladesh.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-xl font-bold text-blue-700">🎯 Our Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To become Bangladesh's most trusted and fastest educational portal where every student can easily find updated notes, test materials, and smart learning tools.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Founder Profile */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            3. About the Founder
          </h2>
          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
            <h3 className="text-xl font-bold text-slate-900">Saiful Islam</h3>
            <p className="text-sm font-medium text-blue-600">
              Assistant Teacher (ICT) | Diploma & B.Sc in Computer Science & Engineering
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              Saiful Islam is an experienced ICT teacher and web developer who is passionate about integrating technology with education. Combining his technical expertise in Computer Science and Engineering with years of classroom teaching experience, he built <strong>SaifulSir.com</strong> to offer modern, fast, and student-friendly online resources.
            </p>
          </div>
        </section>

        {/* 4. What We Offer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            4. What We Offer
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Comprehensive ICT & CSE Notes:</strong> Easy-to-understand lecture sheets for school and college students.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Board Exam Preparation:</strong> Important CQ/MCQ suggestions, previous year board question analysis, and answer sheets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>Smart Interactive Tools:</strong> Progressive Web App (PWA) support allowing students to install and use the site effortlessly on mobile devices.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>100% High-Performance Platform:</strong> Built with cutting-edge technology (Next.js) to guarantee lightning-fast page loading speed even on slow mobile networks.</span>
            </li>
          </ul>
        </section>

        {/* 5. Stay Connected */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            5. Stay Connected
          </h2>
          <p className="text-slate-700">
            Join our growing community of learners and teachers to stay updated with new educational releases and study materials:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3">
              <span>🌐</span>
              <div>
                <p className="font-semibold text-slate-900">Website</p>
                <a href="https://saifulsir.com" className="text-blue-600 hover:underline">https://saifulsir.com</a>
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3">
              <span>📢</span>
              <div>
                <p className="font-semibold text-slate-900">Telegram Channel</p>
                <span className="text-slate-600">Join our student group</span>
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3">
              <span>📺</span>
              <div>
                <p className="font-semibold text-slate-900">YouTube Channel</p>
                <span className="text-slate-600">Watch video tutorials</span>
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3">
              <span>👥</span>
              <div>
                <p className="font-semibold text-slate-900">Facebook Page</p>
                <span className="text-slate-600">Connect with us</span>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Footer Note */}
        <div className="text-center space-y-2 py-4">
          <p className="text-slate-600 italic">
            Thank you for being part of SaifulSir.com. Your trust and support inspire us to create a better, smarter learning future for every student.
          </p>
          <p className="font-bold text-slate-900">— Saiful Islam</p>
          <p className="text-xs text-slate-500">Founder & Lead Developer, SaifulSir.com</p>
        </div>

      </div>
    </main>
  )
                }
