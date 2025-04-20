import React from "react";
import LegalDocumentLayout from "../components/LegalDocumentLayout";

const sections = [
  {
    id: "agreement",
    heading: "Agreement to Terms",
    content: (
      <p>
        By accessing or using the Type 3 Solar Platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
      </p>
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
      <ul className="list-disc ml-6">
        <li>Provide accurate information when using our services</li>
        <li>Comply with all applicable laws and regulations</li>
        <li>Respect intellectual property rights</li>
      </ul>
    ),
  },
  {
    id: "payment",
    heading: "Payment Terms",
    content: (
      <ul className="list-disc ml-6">
        <li>All prices are listed in INR and include applicable taxes</li>
        <li>Payment is due upon order confirmation unless otherwise agreed</li>
        <li>Refunds are subject to our refund policy</li>
      </ul>
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
      <p>
        We may suspend or terminate your access to our services if you violate these Terms and Conditions or applicable laws.
      </p>
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
      <p>
        We may update these Terms and Conditions at any time. Changes will be effective when posted on this page.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact Us",
    content: (
      <p>
        For any questions about these Terms and Conditions, please contact <a href="mailto:privacy@type3.energy" className="underline">privacy@type3.energy</a>.
      </p>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalDocumentLayout
      title="Terms and Conditions"
      lastUpdated="April 20, 2025"
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
