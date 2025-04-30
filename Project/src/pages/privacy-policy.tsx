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
          <li>Profile information from third-party sign-in services (Google, Facebook, or Apple) when you choose to authenticate using these services, which may include your name, email address, profile picture, and unique identifier from these platforms</li>
        </ul>
        <h3 className="text-xl font-semibold mt-6 mb-2">Usage Data</h3>
        <ul className="list-disc ml-6">
          <li>Device information, browser type, and IP address</li>
          <li>Pages visited, actions taken, and time spent</li>
          <li>Authentication methods used (including third-party sign-in services)</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-info",
    heading: "How We Use Your Information",
    content: (
      <>
        <ul className="list-disc ml-6">
          <li>To provide, maintain, and improve our services</li>
          <li>To process transactions and manage user accounts</li>
          <li>To communicate updates, offers, and support</li>
          <li>To comply with legal obligations</li>
          <li>To authenticate your identity when you sign in using third-party services (Google, Facebook, or Apple)</li>
          <li>To personalize your experience based on the information we receive</li>
        </ul>
        <p className="mt-4">
          <strong>Important Note for Third-Party Sign-In Users:</strong> When you use Google, Facebook, or Apple Sign-In, we only collect information necessary for authentication and as permitted by their respective terms. We do not request additional permissions beyond what is required for basic account functionality without your explicit consent.  
        </p>
      </>
    ),
  },
  {
    id: "sharing-info",
    heading: "How We Share Information",
    content: (
      <>
        <ul className="list-disc ml-6">
          <li>With service providers and partners for business operations</li>
          <li>With legal authorities when required by law</li>
          <li>With your consent or at your direction</li>
        </ul>
        <p className="mt-4">
          <strong>Third-Party Authentication Providers:</strong> When you use Google, Facebook, or Apple Sign-In, we may exchange limited information with these providers for authentication purposes only. We do not share your activities on our platform with these providers unless explicitly disclosed and consented to. These providers may collect information about your sign-in activities according to their own terms and privacy policies, which we encourage you to review:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li><a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
          <li><a href="https://www.facebook.com/policy.php" className="underline" target="_blank" rel="noopener noreferrer">Facebook Privacy Policy</a></li>
          <li><a href="https://www.apple.com/legal/privacy/" className="underline" target="_blank" rel="noopener noreferrer">Apple Privacy Policy</a></li>
        </ul>
      </>
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
      <>
        <ul className="list-disc ml-6">
          <li>Access, update, or delete your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Request data portability</li>
          <li>Disconnect third-party sign-in services from your account at any time</li>
          <li>Control what data is shared from third-party authentication providers</li>
        </ul>
        <p className="mt-4">
          <strong>Managing Third-Party Sign-In Connections:</strong> You can review and revoke access to third-party sign-in methods in your account settings. Revoking access will not delete your account but will require you to use alternative sign-in methods.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies & Tracking Technologies",
    content: (
      <>
        <p>
          We use cookies and similar technologies to enhance your experience and analyze site usage. You may control cookies through your browser settings.
        </p>
        <p className="mt-4">
          <strong>Authentication Cookies:</strong> When you sign in using Google, Facebook, or Apple, these services may set their own cookies to facilitate authentication. These cookies are governed by their respective privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. The latest version will always be posted on this page with the updated date.
        </p>
        <p className="mt-4">
          When we make material changes to this policy, particularly those affecting how we use information obtained through third-party sign-in services, we will notify you through appropriate channels and obtain consent where required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "data-deletion",
    heading: "Data Deletion & Retention",
    content: (
      <>
        <p>
          You may request deletion of your personal data at any time by contacting us. When you delete your account, we will remove your personal information from our active databases, though some information may be retained for legal, security, or business purposes as required by law.
        </p>
        <p className="mt-4">
          <strong>Third-Party Authentication Data:</strong> Disconnecting a third-party sign-in method (Google, Facebook, or Apple) will remove the connection between our service and that provider, but will not automatically delete data already collected. To completely remove your data from these providers, please visit their respective privacy centers.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact Us",
    content: (
      <p>
        For questions, concerns about this Privacy Policy, or to request data deletion, please contact our Data Protection Officer at <a href="mailto:privacy@type3.energy" className="underline">privacy@type3.energy</a>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      lastUpdated="April 29, 2025"
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
