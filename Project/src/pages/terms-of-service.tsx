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
      <>
        <ul className="list-disc ml-6">
          <li>Provide accurate and complete information during registration</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
          <li>You may register using your email and password or through third-party authentication providers (Google, Facebook, or Apple)</li>
        </ul>
        <h3 className="text-xl font-semibold mt-6 mb-2">Third-Party Authentication</h3>
        <p>
          When you choose to register or log in using Google, Facebook, or Apple Sign-In:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>You are also bound by the respective terms of service of these providers</li>
          <li>You authorize us to access and use certain account information from these providers, as permitted by their policies and your privacy settings</li>
          <li>You understand that your relationship with these third-party providers is governed by their respective terms and privacy policies</li>
        </ul>
      </>
    ),
  },
  {
    id: "user-conduct",
    heading: "User Conduct",
    content: (
      <>
        <ul className="list-disc ml-6">
          <li>Do not use the platform for unlawful or harmful purposes</li>
          <li>Respect the rights and privacy of others</li>
          <li>Do not attempt to disrupt or compromise our systems</li>
          <li>Do not attempt to circumvent or manipulate the authentication process, including third-party sign-in methods</li>
          <li>Do not create multiple accounts for deceptive or abusive purposes</li>
        </ul>
        <p className="mt-4">
          Violation of these conduct guidelines may result in account suspension or termination, regardless of the authentication method used to create your account.
        </p>
      </>
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
      <>
        <p>
          We reserve the right to suspend or terminate your access to the platform at our discretion, with or without notice, for any violation of these Terms.
        </p>
        <p className="mt-4">
          <strong>Account Deletion:</strong> You may request to delete your account at any time. When you delete your account:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Your personal information will be removed from our active databases</li>
          <li>Some information may be retained as required by law or for legitimate business purposes</li>
          <li>Content you have shared publicly may remain visible</li>
          <li>Third-party authentication connections (Google, Facebook, or Apple) will be severed, but you may need to visit these services separately to manage data they have collected</li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimer",
    heading: "Disclaimer & Limitation of Liability",
    content: (
      <>
        <ul className="list-disc ml-6">
          <li>The platform is provided "as is" without warranties of any kind</li>
          <li>Type 3 is not liable for any indirect, incidental, or consequential damages</li>
        </ul>
        <p className="mt-4">
          <strong>Third-Party Services:</strong> We are not responsible for the availability, accuracy, or content of third-party authentication providers (Google, Facebook, or Apple). Any issues related to these services should be directed to the respective provider.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to Terms",
    content: (
      <>
        <p>
          We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the revised Terms.
        </p>
        <p className="mt-4">
          For material changes affecting your rights and obligations, particularly those related to third-party authentication methods, we will provide notice through appropriate channels and may require your explicit consent to continue using our services.
        </p>
      </>
    ),
  },
  {
    id: "data-portability",
    heading: "Data Portability & Account Access",
    content: (
      <p>
        You have the right to request a copy of your personal data in a structured, commonly used, and machine-readable format. If you signed up using a third-party authentication provider, you can request to transfer your account to a direct email-based login or to another supported authentication method.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact Us",
    content: (
      <p>
        For questions or concerns regarding these Terms, account deletion requests, or data portability inquiries, contact us at <a href="mailto:privacy@type3.energy" className="underline">privacy@type3.energy</a>.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalDocumentLayout
      title="Terms of Service"
      lastUpdated="April 29, 2025"
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
