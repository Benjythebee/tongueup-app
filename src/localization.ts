
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export type AppLanguage = keyof typeof resources;

// Language picked in Settings (unset until the user picks one, so the device language applies)
const LANGUAGE_STORAGE_KEY = "settings.lang";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    resources: resources,
    // Start in the device language; the saved choice is applied below once storage is read
    lng: getLocales()[0]?.languageCode || 'en',
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

/** Resolves once the language saved in Settings (if any) is applied */
export const languageRestored: Promise<void> = AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  .then(async (language) => {
    if (language && language in resources && language !== i18n.language) {
      await i18n.changeLanguage(language);
    }
  })
  .catch((error) => console.log("Error reading language", error));

/** Switches the app language and remembers it across restarts */
export const setAppLanguage = async (language: AppLanguage) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export default i18n;
