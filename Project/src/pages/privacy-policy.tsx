import React from "react";
import LegalDocumentLayout from "../components/LegalDocumentLayout";

const sections = [
  {
    id: "introduction",
    heading: "Introduction",
    content: (
      <>
        <p>
          This Privacy Policy explains how Type 3 Solar Platform ("Type 3", "we", "our", or "us") collects, uses, and protects your personal information when you use our services and website.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    heading: "Information We Collect",
    content: (
      <>
        <h3 className="text-xl font-semibold mt-6 mb-2">Personal Information</h3>
        <ul className="list-disc ml-6">
          <li>Name, email address, phone number, and address</li>
          <li>Account credentials</li>
          <li>Payment and transaction details</li>
        </ul>
        <h3 className="text-xl font-semibold mt-6 mb-2">Usage Data</h3>
        <ul className="list-disc ml-6">
          <li>Device information, browser type, and IP address</li>
          <li>Pages visited, actions taken, and time spent</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-info",
    heading: "How We Use Your Information",
    content: (
      <ul className="list-disc ml-6">
        <li>To provide, maintain, and improve our services</li>
        <li>To process transactions and manage user accounts</li>
        <li>To communicate updates, offers, and support</li>
        <li>To comply with legal obligations</li>
      </ul>
    ),
  },
  {
    id: "sharing-info",
    heading: "How We Share Information",
    content: (
      <ul className="list-disc ml-6">
        <li>With service providers and partners for business operations</li>
        <li>With legal authorities when required by law</li>
        <li>With your consent or at your direction</li>
      </ul>
    ),
  },
  {
    id: "data-security",
    heading: "Data Security",
    content: (
      <p>
        We implement industry-standard measures to protect your data from unauthorized access, disclosure, or misuse. However, no system is completely secure.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "Your Rights & Choices",
    content: (
      <ul className="list-disc ml-6">
        <li>Access, update, or delete your information</li>
        <li>Opt-out of marketing communications</li>
        <li>Request data portability</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies & Tracking Technologies",
    content: (
      <p>
        We use cookies and similar technologies to enhance your experience and analyze site usage. You may control cookies through your browser settings.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. The latest version will always be posted on this page with the updated date.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact Us",
    content: (
      <p>
        For questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@type3.energy" className="underline">privacy@type3.energy</a>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      lastUpdated="April 20, 2025"
      intro="Your privacy is important to us. This policy outlines how we handle your data and your rights as a user."
      sections={sections}
      footerInfo={{
        email: "privacy@type3.energy",
        address: "Type 3 Energy Pvt Ltd, 123 Solar Avenue, Bengaluru, KA 560001, India",
        phone: "+91 98765 43210",
      }}
    />
  );
}
