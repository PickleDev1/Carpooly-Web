"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-6 text-gray-700">
        At CarPooly, your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li><strong>Account Information:</strong> Name, email address, and profile details you provide when signing up.</li>
          <li><strong>Carpool Details:</strong> Information about carpools you create or join, such as carpool names, destinations, and schedules.</li>
          <li><strong>Location Data:</strong> With your permission, we collect location data to enable real-time tracking and improve your carpool experience.</li>
          <li><strong>Usage Data:</strong> Information about how you use CarPooly, including app interactions and feature usage.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>To provide and improve the CarPooly service.</li>
          <li>To facilitate carpool organization, scheduling, and communication.</li>
          <li>To personalize your experience and show relevant information.</li>
          <li>To ensure the safety and security of our users.</li>
          <li>To comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Sharing Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>We <strong>do not sell</strong> your personal information to third parties.</li>
          <li>We may share information with trusted service providers who help us operate CarPooly (e.g., hosting, analytics, customer support).</li>
          <li>We may share information if required by law or to protect the rights and safety of CarPooly and its users.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
        <p className="text-gray-700">
          We use industry-standard security measures to protect your data. However, no method of transmission or storage is 100% secure. We encourage you to use strong passwords and keep your account information confidential.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Your Rights & Choices</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>You can access and update your account information at any time.</li>
          <li>You can request deletion of your account and data by contacting us.</li>
          <li>You can control location sharing in your app settings.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Changes to This Policy</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions or concerns about this Privacy Policy or your data, please contact us at <a href="mailto:cidambi.nikhil@gmail.com" className="text-primary underline">cidambi.nikhil@gmail.com</a>.
        </p>
      </section>

      <p className="text-gray-500 text-sm mt-8">Effective date: July 2024</p>
    </div>
  );
} 