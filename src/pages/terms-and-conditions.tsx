import React from "react";
import LegalDocumentLayout from "../components/LegalDocumentLayout";

const sections = [
  {
    id: "agreement",
    heading: "Agreement to Terms",
    content: (
      <>
        <p>
          By accessing or using the Type 3 Solar Platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
        </p>
        <p className="mt-4">
          <strong>Third-Party Authentication:</strong> If you choose to register or sign in using Google, Facebook, or Apple authentication services, you also agree to comply with their respective terms of service and privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "services",
    heading: "Services Provided",
    content: (
      <ul className="list-disc ml-6">
        <li>Solar system recommendations and quotations</li>
        <li>Site visit booking and installation management</li>
        <li>Support ticketing and customer service</li>
      </ul>
    ),
  },
  {
    id: "user-obligations",
    heading: "User Obligations",
    content: (
      <>
        <ul className="list-disc ml-6">
          <li>Provide accurate information when using our services</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Respect intellectual property rights</li>
          <li>Maintain the security of your account and promptly notify us of any unauthorized access</li>
          <li>Use only authentication methods that you are legally authorized to use</li>
        </ul>
        <p className="mt-4">
          <strong>Authentication Responsibilities:</strong> When using third-party authentication services (Google, Facebook, or Apple), you are responsible for maintaining the security of those accounts. Any actions taken through your authenticated session are your responsibility.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    heading: "Payment Terms",
    content: (
      <>
        <ul className="list-disc ml-6">
          <li>All prices are listed in INR and include applicable taxes</li>
          <li>Payment is due upon order confirmation unless otherwise agreed</li>
          <li>Refunds are subject to our refund policy</li>
        </ul>
        <p className="mt-4">
          <strong>In-App Purchases:</strong> If you make purchases through our platform after signing in with Google, Facebook, or Apple authentication, these transactions are processed according to our payment terms, not those of the authentication provider. However, if you use Apple's in-app purchase system, those transactions are subject to Apple's terms and conditions.
        </p>
      </>
    ),
  },
  {
    id: "warranties",
    heading: "Warranties & Disclaimers",
    content: (
      <ul className="list-disc ml-6">
        <li>We provide warranties as described in product documentation</li>
        <li>No other warranties are implied</li>
        <li>Type 3 is not liable for indirect or consequential damages</li>
      </ul>
    ),
  },
  {
    id: "termination",
    heading: "Termination & Suspension",
    content: (
      <>
        <p>
          We may suspend or terminate your access to our services if you violate these Terms and Conditions or applicable laws.
        </p>
        <p className="mt-4">
          <strong>Account Deletion:</strong> You may request to delete your account at any time by contacting us. Upon deletion:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Your personal data will be handled according to our Privacy Policy</li>
          <li>Third-party authentication connections will be severed</li>
          <li>You may need to separately manage or delete your data with Google, Facebook, or Apple according to their policies</li>
        </ul>
      </>
    ),
  },
  {
    id: "governing-law",
    heading: "Governing Law",
    content: (
      <p>
        These Terms are governed by the laws of India. Disputes will be resolved in the courts of Bengaluru, Karnataka.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to These Terms",
    content: (
      <>
        <p>
          We may update these Terms and Conditions at any time. Changes will be effective when posted on this page.
        </p>
        <p className="mt-4">
          For material changes that affect your rights or obligations, especially those related to third-party authentication methods, we will provide reasonable notice through the platform or via email before the changes take effect.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    heading: "Third-Party Authentication Services",
    content: (
      <>
        <p>
          Our platform supports authentication through Google, Facebook, and Apple. By using these services:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>You acknowledge that we are not responsible for the security, privacy practices, or content of these third-party services</li>
          <li>You understand that these services may collect and use information according to their own privacy policies</li>
          <li>You agree that we may receive and store certain information from these providers as described in our Privacy Policy</li>
          <li>You can revoke our access to your third-party accounts at any time through your account settings with those providers</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact Us",
    content: (
      <p>
        For any questions about these Terms and Conditions, account management, or data concerns, please contact <a href="mailto:privacy@type3.energy" className="underline">privacy@type3.energy</a>.
      </p>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalDocumentLayout
      title="Terms and Conditions"
      lastUpdated="April 29, 2025"
      intro="These terms govern your access to and use of Type 3 Solar Platform’s services."
      sections={sections}
      footerInfo={{
        email: "privacy@type3.energy",
        address: "Type 3 Energy Pvt Ltd, 123 Solar Avenue, Bengaluru, KA 560001, India",
        phone: "+91 98765 43210",
      }}
    />
  );
}
