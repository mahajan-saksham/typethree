import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface Section {
  id: string;
  heading: string;
  content: React.ReactNode;
}

interface LegalDocumentLayoutProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: Section[];
  footerInfo: {
    email: string;
    address: string;
    phone: string;
  };
}

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0]);
  useEffect(() => {
    function onScroll() {
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top - 120 <= 0) current = id;
        }
      }
      setActive(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);
  return active;
}

const LegalDocumentLayout: React.FC<LegalDocumentLayoutProps> = ({
  title,
  lastUpdated,
  intro,
  sections,
  footerInfo,
}) => {
  const tocRef = useRef<HTMLDivElement>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const sectionIds = sections.map((s) => s.id);
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    function handleScroll() {
      setShowTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocOpen(false);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-inter">
      {/* Header */}
      <header className="w-full border-b border-gray-700 sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md px-4 md:px-0">
        <div className="max-w-4xl mx-auto py-8 flex flex-col gap-2 items-start">
          <h1 className="font-satoshi text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          <span className="text-gray-300 text-base mb-1">Last updated: {lastUpdated}</span>
          <p className="text-gray-300 text-lg font-inter max-w-2xl">{intro}</p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4 md:px-0 py-8 relative">
        {/* Table of Contents */}
        {/* Desktop/Tablet: Sticky Sidebar */}
        <aside className="hidden md:block md:w-1/4 pr-4">
          <div className="sticky top-28">
            <nav ref={tocRef} aria-label="Table of contents" className="border-l-2 border-gray-700 pl-4">
              <div className="mb-4 text-lg font-semibold text-gray-300 uppercase tracking-wide">Contents</div>
              <ul className="flex flex-col gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={twMerge(
                        "block text-left text-base transition-colors duration-300 py-1 px-2 rounded hover:bg-white/10 focus:outline-none",
                        activeSection === section.id ? "text-primary font-bold bg-white/10" : "text-gray-300"
                      )}
                    >
                      {section.heading}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
        {/* Mobile: Collapsible ToC */}
        <aside className="md:hidden mb-6">
          <button
            onClick={() => setTocOpen((v) => !v)}
            className="w-full flex justify-between items-center py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-lg font-semibold text-gray-200"
          >
            Table of Contents
            <svg
              className={twMerge("w-5 h-5 transition-transform", tocOpen ? "rotate-180" : "")}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {tocOpen && (
            <nav className="mt-2 border-l-2 border-gray-700 pl-4 bg-neutral-950/90 rounded-lg">
              <ul className="flex flex-col gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={twMerge(
                        "block w-full text-left text-base transition-colors duration-300 py-1 px-2 rounded hover:bg-white/10 focus:outline-none",
                        activeSection === section.id ? "text-primary font-bold bg-white/10" : "text-gray-300"
                      )}
                    >
                      {section.heading}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        {/* Content Body */}
        <section className="flex-1 min-w-0">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              id={section.id}
              className={twMerge(
                "scroll-mt-32",
                idx !== 0 ? "border-t border-gray-700" : ""
              )}
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * idx }}
                className="font-satoshi text-2xl md:text-3xl font-bold mt-8 mb-4 text-white"
              >
                {section.heading}
              </motion.h2>
              <div className="prose prose-invert prose-li:marker:text-primary prose-headings:font-satoshi prose-headings:text-white prose-p:text-gray-300 text-base leading-relaxed my-8 max-w-none">
                {section.content}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary/80 hover:bg-primary text-white rounded-full p-3 shadow-lg transition-colors duration-300"
          aria-label="Back to top"
        >
          <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Footer */}
      <footer className="w-full mt-16 border-t border-gray-700 bg-neutral-950 px-4 md:px-0">
        <div className="max-w-4xl mx-auto py-8 flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-gray-300">
          <div>
            <div className="font-semibold text-white">Contact</div>
            <div className="text-gray-300">Email: <a href="mailto:{footerInfo.email}" className="underline hover:text-primary">{footerInfo.email}</a></div>
            <div className="text-gray-300">Phone: <a href={`tel:${footerInfo.phone}`} className="underline hover:text-primary">{footerInfo.phone}</a></div>
          </div>
          <div className="mt-2 md:mt-0">
            <div className="font-semibold text-white">Address</div>
            <div className="text-gray-300">{footerInfo.address}</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalDocumentLayout;
