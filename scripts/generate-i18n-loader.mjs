import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.join(__dirname, "..");

const enData = JSON.parse(
  fs.readFileSync(path.join(projectDir, "src/ui/locales/en.json"), "utf8"),
);
const langNames = {
  en: "English",
  es: "Español",
  "es-MX": "Español (MX)",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  "pt-BR": "Português (BR)",
  "pt-PT": "Português (PT)",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  ru: "Русский",
  sv: "Svenska",
  ko: "한국어",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  ar: "العربية",
  he: "עברית",
  cs: "Čeština",
  da: "Dansk",
  fi: "Suomi",
  hu: "Magyar",
  ro: "Română",
  sk: "Slovenčina",
  sl: "Slovenščina",
  uk: "Українська",
  bg: "Български",
  ca: "Català",
  el: "Ελληνικά",
  et: "Eesti",
  eu: "Euskara",
  hi: "हिन्दी",
  hr: "Hrvatski",
  kab: "Taqbaylit",
  lb: "Lëtzebuergesch",
  lt: "Lietuvių",
  "nb-NO": "Norsk Bokmål",
  sq: "Shqip",
  sr: "Српски",
};

const output = `/* eslint-env browser */
(function () {
  'use strict';

  var DEFAULT_LOCALE = 'en';
  var loaded = {};
  var pending = {};
  var currentLocale = localStorage.getItem('friendarr_language') || DEFAULT_LOCALE;

  var langNames = ${JSON.stringify(langNames)};

  // English translations embedded inline for synchronous access
  loaded.en = ${JSON.stringify(enData)};

  function fireReady() {
    window.dispatchEvent(new CustomEvent('translationsloaded', { detail: { locale: currentLocale } }));
  }

  function loadLocale(locale) {
    if (loaded[locale]) return Promise.resolve(loaded[locale]);
    if (pending[locale]) return pending[locale];

    pending[locale] = fetch('/locales/' + locale + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load locale: ' + locale);
        return res.json();
      })
      .then(function (data) {
        loaded[locale] = data;
        delete pending[locale];
        if (locale === currentLocale) fireReady();
        return data;
      })
      .catch(function (err) {
        delete pending[locale];
        console.warn('Failed to load locale ' + locale + ':', err.message);
        if (locale !== DEFAULT_LOCALE) {
          return loadLocale(DEFAULT_LOCALE);
        }
        loaded[locale] = loaded[DEFAULT_LOCALE] || {};
        if (locale === currentLocale) fireReady();
        return loaded[locale];
      });

    return pending[locale];
  }

  window.T = function (key, fallback) {
    var dict = loaded[currentLocale] || loaded[DEFAULT_LOCALE];
    return dict[key] || fallback || key;
  };

  window.setLanguage = function (lang) {
    localStorage.setItem('friendarr_language', lang);
    currentLocale = lang;
    if (lang === DEFAULT_LOCALE) {
      fireReady();
    } else {
      loadLocale(lang);
    }
  };

  window.getLanguage = function () {
    return currentLocale;
  };

  window.getLanguageName = function (lang) {
    var code = lang || currentLocale;
    return langNames[code] || code;
  };

  window.LANGUAGES = langNames;

  window.reloadTranslations = function () {
    return loadLocale(currentLocale);
  };

  // Preload user locale if different from en
  if (currentLocale !== DEFAULT_LOCALE) {
    loadLocale(currentLocale);
  } else {
    fireReady();
  }
})();
`;

const outPath = path.join(projectDir, "src/ui/i18n.js");
fs.writeFileSync(outPath, output);
console.log(
  "Wrote i18n.js with inline English translations (" +
    Object.keys(enData).length +
    " keys)",
);
