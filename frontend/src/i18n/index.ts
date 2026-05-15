import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

export const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

// 默认语言，从环境变量读取，默认为中文
const defaultLanguage = (import.meta.env.VITE_DEFAULT_LANGUAGE as string) || 'zh';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;