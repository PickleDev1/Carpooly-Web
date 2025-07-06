"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-8 text-gray-700 text-lg">
        Welcome to CarPooly! These Terms of Service (&quot;Terms&quot;) govern your use of the CarPooly website and services. By accessing or using CarPooly, you agree to these Terms. Please read them carefully.
      </p>

      {/* Table of Contents */}
      <nav className="mb-10 border-l-4 border-primary pl-4 bg-gray-50 rounded">
        <h2 className="font-semibold text-lg mb-2">Table of Contents</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-1 text-base">
          <li><a href="#acceptance" className="text-primary hover:underline">Acceptance of Terms</a></li>
          <li><a href="#use" className="text-primary hover:underline">Use of Service</a></li>
          <li><a href="#accounts" className="text-primary hover:underline">User Accounts</a></li>
          <li><a href="#content" className="text-primary hover:underline">Content</a></li>
          <li><a href="#prohibited" className="text-primary hover:underline">Prohibited Conduct</a></li>
          <li><a href="#termination" className="text-primary hover:underline">Termination</a></li>
          <li><a href="#disclaimers" className="text-primary hover:underline">Disclaimers</a></li>
          <li><a href="#liability" className="text-primary hover:underline">Limitation of Liability</a></li>
          <li><a href="#changes" className="text-primary hover:underline">Changes to These Terms</a></li>
          <li><a href="#contact" className="text-primary hover:underline">Contact Us</a></li>
        </ol>
      </nav>

      <div className="space-y-10">
        {/* Section 1 */}
        <section id="acceptance">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">1.</span> Acceptance of Terms</h2>
          <div className="border-b border-gray-200 mb-4" />
          <p className="text-gray-700 text-base">By accessing or using CarPooly, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our service.</p>
        </section>

        {/* Section 2 */}
        <section id="use">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">2.</span> Use of Service</h2>
          <div className="border-b border-gray-200 mb-4" />
          <ul className="list-disc pl-6 text-gray-700 text-base space-y-1">
            <li>You must be at least 13 years old to use CarPooly.</li>
            <li>You agree to use CarPooly only for lawful purposes and in accordance with these Terms.</li>
            <li>CarPooly is intended for organizing carpools with people you know. It is not a ride-matching service for strangers.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="accounts">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">3.</span> User Accounts</h2>
          <div className="border-b border-gray-200 mb-4" />
          <ul className="list-disc pl-6 text-gray-700 text-base space-y-1">
            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
            <li>You agree to provide accurate and complete information when creating your account.</li>
            <li>You are responsible for all activities that occur under your account.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="content">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">4.</span> Content</h2>
          <div className="border-b border-gray-200 mb-4" />
          <ul className="list-disc pl-6 text-gray-700 text-base space-y-1">
            <li>You retain ownership of any content you submit to CarPooly, but grant us a license to use it as needed to provide the service.</li>
            <li>You agree not to post content that is unlawful, harmful, or violates the rights of others.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="prohibited">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">5.</span> Prohibited Conduct</h2>
          <div className="border-b border-gray-200 mb-4" />
          <ul className="list-disc pl-6 text-gray-700 text-base space-y-1">
            <li>No harassment, abuse, or impersonation of others.</li>
            <li>No unauthorized commercial use of CarPooly.</li>
            <li>No attempts to disrupt or harm the service or other users.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="termination">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">6.</span> Termination</h2>
          <div className="border-b border-gray-200 mb-4" />
          <p className="text-gray-700 text-base">We may suspend or terminate your access to CarPooly at any time for violation of these Terms or for any other reason. You may also delete your account at any time.</p>
        </section>

        {/* Section 7 */}
        <section id="disclaimers">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">7.</span> Disclaimers</h2>
          <div className="border-b border-gray-200 mb-4" />
          <p className="text-gray-700 text-base">CarPooly is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, reliability, or availability of the service. Use CarPooly at your own risk.</p>
        </section>

        {/* Section 8 */}
        <section id="liability">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">8.</span> Limitation of Liability</h2>
          <div className="border-b border-gray-200 mb-4" />
          <p className="text-gray-700 text-base">To the fullest extent permitted by law, CarPooly and its affiliates are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        {/* Section 9 */}
        <section id="changes">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">9.</span> Changes to These Terms</h2>
          <div className="border-b border-gray-200 mb-4" />
          <p className="text-gray-700 text-base">We may update these Terms from time to time. We will notify you of significant changes by posting the new Terms on this page and updating the effective date.</p>
        </section>

        {/* Section 10 */}
        <section id="contact">
          <h2 className="text-2xl font-semibold mb-2"><span className="font-bold text-primary">10.</span> Contact Us</h2>
          <div className="border-b border-gray-200 mb-4" />
          <p className="text-gray-700 text-base">If you have any questions about these Terms, please contact us at <a href="mailto:cidambi.nikhil@gmail.com" className="text-primary underline">cidambi.nikhil@gmail.com</a>.</p>
        </section>
      </div>

      <p className="text-gray-500 text-sm mt-12">Effective date: July 2024</p>
    </div>
  );
} 