/* eslint-env browser */
(function () {
  'use strict';

  var DEFAULT_LOCALE = 'en';
  var loaded = {};
  var pending = {};
  var currentLocale = localStorage.getItem('friendarr_language') || DEFAULT_LOCALE;

  var langNames = {
    en: 'English',
    es: 'Español',
    'es-MX': 'Español (MX)',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
    'pt-BR': 'Português (BR)',
    'pt-PT': 'Português (PT)',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    ru: 'Русский',
    sv: 'Svenska',
    ko: '한국어',
    tr: 'Türkçe',
    vi: 'Tiếng Việt',
    ar: 'العربية',
    he: 'עברית',
    cs: 'Čeština',
    da: 'Dansk',
    fi: 'Suomi',
    hu: 'Magyar',
    ro: 'Română',
    sk: 'Slovenčina',
    sl: 'Slovenščina',
    uk: 'Українська',
    bg: 'Български',
    ca: 'Català',
    el: 'Ελληνικά',
    et: 'Eesti',
    eu: 'Euskara',
    hi: 'हिन्दी',
    hr: 'Hrvatski',
    kab: 'Taqbaylit',
    lb: 'Lëtzebuergesch',
    lt: 'Lietuvių',
    'nb-NO': 'Norsk Bokmål',
    sq: 'Shqip',
    sr: 'Српски',
  };

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
        return data;
      })
      .catch(function (err) {
        delete pending[locale];
        console.warn('Failed to load locale ' + locale + ':', err.message);
        if (locale !== DEFAULT_LOCALE) {
          return loadLocale(DEFAULT_LOCALE);
        }
        loaded[locale] = {};
        return loaded[locale];
      });

    return pending[locale];
  }

  window.T = function (key, fallback) {
    var dict = loaded[currentLocale] || loaded[DEFAULT_LOCALE];

    if (!dict) {
      loadLocale(currentLocale);
      loadLocale(DEFAULT_LOCALE);
      return fallback || key;
    }

    return dict[key] || (loaded[DEFAULT_LOCALE] ? loaded[DEFAULT_LOCALE][key] : null) || fallback || key;
  };

  window.setLanguage = function (lang) {
    localStorage.setItem('friendarr_language', lang);
    currentLocale = lang;
    loadLocale(lang);
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
    return Promise.all([
      loadLocale(currentLocale),
      loadLocale(DEFAULT_LOCALE),
    ]);
  };

  // Preload
  loadLocale(currentLocale);
  loadLocale(DEFAULT_LOCALE);
})();
