
import { getLocales } from 'expo-localization';
import en from './localization/en'
import fr from './localization/fr'
import i18n from "i18next";
import {  initReactI18next } from "react-i18next";

export const defaultNS = "en";
const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
} as const;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    resources: resources,
    lng: getLocales()[0].languageCode||undefined, // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

export default i18n;