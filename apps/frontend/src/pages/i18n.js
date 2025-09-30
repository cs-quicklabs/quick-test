import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/assets/i18n/common/{{lng}}.json",
    },
    fallbackLng: "en",
    lng: localStorage.getItem("i18nextLng") || "en",
    debug: false,
    supportedLngs: ["en", "ar", "es"],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ",",
    },
    react: { useSuspense: true },
  });

export default i18n;
