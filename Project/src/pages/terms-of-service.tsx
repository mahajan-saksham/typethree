import React from "react";
import LegalDocumentLayout from "../components/LegalDocumentLayout";

const sections = [
  {
    id: "overview",
    heading: "Overview",
    content: (
      <p>
        These Terms of Service ("Terms") govern your use of the Type 3 Solar Platform. By accessing or using our services, you agree to these Terms.
      </p>
    ),
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    content: (
      <p>
        You must be at least 18 years old and have the legal capacity to enter into a binding agreement to use our services.
      </p>
    ),
  },
  {
    id: "account",
    heading: "Account Registration & Security",
    content: (
      <ul className="list-disc ml-6">
        <li>Provide accurate and complete information during registration</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorized use of your account</li>
      </ul>
    ),
  },
  {
    id: "user-conduct",
    heading: "User Conduct",
    content: (
      <ul className="list-disc ml-6">
        <li>Do not use the platform for unlawful or harmful purposes</li>
        <li>Respect the rights and privacy of others</li>
        <li>Do not attempt to disrupt or compromise our systems</li>
      </ul>
    ),
  },
  {
    id: "intellectual-property",
    heading: "Intellectual Property",
    content: (
      <p>
        All content and materials on the platform are owned by or licensed to Type 3. You may not use, reproduce, or distribute them without permission.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Termination",
    content: (
      <p>
        We reserve the right to suspend or terminate your access to the platform at our discretion, with or without notice, for any violation of these Terms.
      </p>
    ),
  },
  {
    id: "disclaimer",
    heading: "Disclaimer & Limitation of Liability",
    content: (
      <ul className="list-disc ml-6">
        <li>The platform is provided "as is" without warranties of any kind</li>
        <li>Type 3 is not liable for any indirect, incidental, or consequential damages</li>
      </ul>
    ),
  },
  {
    id: "changes",
    heading: "Changes to Terms",
    content: (
      <p>
        We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact Us",
    content: (
      <p>
        For questions or concerns regarding these Terms, contact us at <a href="mailto:privacy@type3.energy" className="underline">privacy@type3.energy</a>.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalDocumentLayout
      title="Terms of Service"
      lastUpdated="April 20, 2025"
      intro="Please read these terms carefully before using the Type 3 Solar Platform."
      sections={sections}
      footerInfo={{
        email: "privacy@type3.energy",
        address: "Type 3 Energy Pvt Ltd, 123 Solar Avenue, Bengaluru, KA 560001, India",
        phone: "+91 98765 43210",
      }}
    />
  );
}
