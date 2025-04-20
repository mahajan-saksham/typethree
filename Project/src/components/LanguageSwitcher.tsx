import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <select
      className="rounded px-2 py-1 bg-dark-200 text-light border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
      value={i18n.language}
      onChange={e => i18n.changeLanguage(e.target.value)}
      aria-label="Switch language"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
