import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '0.375rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      title={i18n.language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {i18n.language === 'zh' ? 'EN' : '中'}
    </button>
  );
}