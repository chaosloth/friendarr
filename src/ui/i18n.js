/* eslint-env browser */
(function () {
  "use strict";

  var DEFAULT_LOCALE = "en";
  var loaded = {};
  var pending = {};
  var currentLocale =
    localStorage.getItem("friendarr_language") || DEFAULT_LOCALE;

  var langNames = {
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

  // English translations embedded inline for synchronous access
  loaded.en = {
    "apiKeys.close": "Close",
    "apiKeys.copyToClipboard": "Copy to Clipboard",
    "apiKeys.createKey": "Create Key",
    "apiKeys.created": "Key Created",
    "apiKeys.description":
      "API keys allow external services (such as Seerr) to authenticate with Friendarr and submit download jobs.",
    "apiKeys.label": "Label",
    "apiKeys.newKey": "New API Key",
    "apiKeys.newKeyHint":
      "Give this key a memorable name so you know what it is for.",
    "apiKeys.noKeys": "No API keys yet. Create one to get started.",
    "apiKeys.revoke": "Revoke",
    "apiKeys.showKey": "Show Key",
    "apiKeys.title": "API Keys",
    "apiKeys.unknownError": "An unknown error occurred.",
    "auth.authenticate": "Authenticate",
    "auth.authenticateToContinue": "Enter your master API key to continue.",
    "auth.authenticateToManageSettings": "Authenticate to manage settings",
    "auth.authenticateToViewQueue": "Authenticate to view the queue",
    "auth.authenticated": "Authenticated",
    "auth.connect": "Connect",
    "auth.invalidKey": "Invalid API key",
    "auth.logout": "Log Out",
    "auth.masterApiKey": "Master API Key",
    "auth.modalDescription":
      "Enter your master API key to manage the queue and settings.",
    "auth.modalTitle": "Authentication Required",
    "auth.notAuthenticated": "Not Authenticated",
    "browse.failed": "Failed to list directory contents.",
    "browse.noDirectories": "No directories found.",
    "browse.select": "Select",
    "browse.title": "Browse",
    "common.cancel": "Cancel",
    "common.failedToLoadSettings": "Failed to load settings.",
    "common.save": "Save",
    "display.language": "Language",
    "display.languageDescription":
      "Choose your preferred language for the interface.",
    "display.title": "Display",
    "general.description":
      "Configure concurrency, test mode, logging, and language.",
    "general.setupWizard": "Re-run Setup Wizard",
    "general.title": "General",
    "event.download.complete": "Download Completed",
    "event.download.failed": "Download Failed",
    "event.download.requested": "Download Requested",
    "event.download.started": "Download Started",
    "limits.bandwidthHint": "Set to 0 for unlimited.",
    "limits.description":
      "Configure download concurrency, bandwidth, and test mode.",
    "limits.logLevel": "Log Level",
    "limits.logLevelDescription":
      "Minimum log level for console output and the log buffer.",
    "limits.maxBandwidth": "Max Bandwidth (bytes/sec)",
    "limits.maxConcurrent": "Max Concurrent Downloads",
    "limits.testMode": "Test Mode",
    "limits.testModeDescription":
      "When enabled, downloads are skipped and jobs are marked complete immediately.",
    "limits.testModeEnabled":
      "Test mode is currently enabled. Downloads are being skipped.",
    "limits.title": "Limits",
    "logs.all": "All",
    "logs.autoRefresh": "Auto-refresh",
    "logs.description": "View recent log entries from the server.",
    "logs.failedToLoad": "Failed to load logs.",
    "logs.loading": "Loading...",
    "logs.noEntries": "No log entries.",
    "logs.title": "Logs",
    "nav.queue": "Queue",
    "nav.settings": "Settings",
    "page.queue": "Queue",
    "page.settings": "Settings",
    "paths.browse": "Browse",
    "paths.completed": "Completed Path",
    "paths.completedHint": "Root directory for finished media downloads.",
    "paths.description":
      "Configure where incomplete and completed downloads are stored on disk.",
    "paths.incomplete": "Incomplete Path",
    "paths.incompleteHint": "Directory for files currently being downloaded.",
    "paths.movieDir": "Movie Directory",
    "paths.movieDirHint":
      "Where movies are placed. Defaults to {completedPath}/movies.",
    "paths.title": "Paths",
    "paths.tvDir": "TV Directory",
    "paths.tvDirHint":
      "Where TV shows are placed. Defaults to {completedPath}/tv.",
    "queue.cancel": "Cancel",
    "queue.clearFinished": "Clear Finished",
    "queue.column.actions": "Actions",
    "queue.column.created": "Created",
    "queue.column.size": "Size",
    "queue.column.status": "Status",
    "queue.column.title": "Title",
    "queue.column.type": "Type",
    "queue.failedToLoad": "Failed to load queue.",
    "queue.globallyPaused": "Queue is globally paused",
    "queue.noDownloads": "No downloads in the queue.",
    "queue.pause": "Pause",
    "queue.pauseAll": "Pause All",
    "queue.resumeAll": "Resume All",
    "queue.retry": "Retry",
    "queue.stats.complete": "Complete",
    "queue.stats.downloading": "Downloading",
    "queue.stats.failed": "Failed",
    "queue.stats.queued": "Queued",
    "schedules.addSchedule": "Add Schedule",
    "schedules.addWindow": "Add Window",
    "schedules.description":
      "Limit downloads to specific days and time windows.",
    "schedules.end": "End",
    "schedules.fri": "Fri",
    "schedules.mon": "Mon",
    "schedules.remove": "Remove",
    "schedules.sat": "Sat",
    "schedules.saveSchedule": "Save Schedule",
    "schedules.start": "Start",
    "schedules.sun": "Sun",
    "schedules.thu": "Thu",
    "schedules.title": "Schedules",
    "schedules.tue": "Tue",
    "schedules.wed": "Wed",
    "settings.tab.apiKeys": "API Keys",
    "settings.tab.display": "Display",
    "settings.tab.limits": "Limits",
    "settings.tab.logs": "Logs",
    "settings.tab.general": "General",
    "settings.tab.paths": "Paths",
    "settings.tab.schedules": "Schedules",
    "settings.tab.webhooks": "Webhooks",
    "status.complete": "Complete",
    "status.downloading": "Downloading",
    "status.failed": "Failed",
    "status.queued": "Queued",
    "webhooks.active": "Active",
    "webhooks.addWebhook": "Add Webhook",
    "webhooks.delete": "Delete",
    "webhooks.description":
      "Configure webhooks to receive notifications for download events.",
    "webhooks.disabled": "Disabled",
    "webhooks.edit": "Edit",
    "webhooks.editWebhook": "Edit Webhook",
    "webhooks.enabled": "Enabled",
    "webhooks.events": "Events",
    "webhooks.secret": "Secret",
    "webhooks.secretHint":
      "Optional secret for payload signature verification.",
    "webhooks.secretSet": "Secret is set",
    "webhooks.test": "Test",
    "webhooks.testSuccess": "Webhook test was successful.",
    "webhooks.title": "Webhooks",
    "webhooks.url": "URL",
    "wizard.back": "Back",
    "wizard.finish": "Finish",
    "wizard.next": "Next",
    "wizard.skip": "Skip",
    "wizard.step1.description":
      "Choose your preferred language for the interface.",
    "wizard.step1.title": "Step 1: Language",
    "wizard.step2.description":
      "Generate your master API key. This key is required to access the dashboard.",
    "wizard.step2.keyHint":
      "Generate a strong random key. Save it somewhere secure — it cannot be recovered.",
    "wizard.step2.keyLabel": "API Key",
    "wizard.step2.pasteKey": "Paste your master API key",
    "wizard.step2.masterKeySet":
      "A master key is configured on the server. Enter it below to access the dashboard.",
    "wizard.step2.noMasterKey":
      "No master API key is configured. Generate one below, then click Activate to save it.",
    "wizard.step2.activate": "Save & Activate Key",
    "wizard.step2.activating": "Activating...",
    "wizard.step2.title": "Step 2: Set API Key",
    "wizard.step2.authFailed":
      "Invalid master key. Check your .env file and try again.",
    "wizard.step3.completed": "Completed Path",
    "wizard.step3.completedHint": "Root directory for finished media.",
    "wizard.step3.description":
      "Configure where incomplete and completed downloads are stored.",
    "wizard.step3.incomplete": "Incomplete Path",
    "wizard.step3.incompleteHint":
      "Directory for files currently being downloaded.",
    "wizard.step3.title": "Step 3: Locations",
    "wizard.step3.detail":
      "Files download to the incomplete path first, then are hard-linked to the completed path on success. Set separate directories for movies and TV shows.",
    "wizard.step1.detail":
      "Friendarr supports 41 languages including English, Spanish, French, German, Japanese, Chinese, Portuguese, Italian, Dutch, Polish, Russian, Swedish, Korean, Turkish, Vietnamese, Arabic, Hebrew, and many more.",
    "wizard.step2.detail":
      "This key is used by Seerr and other clients to authenticate with Friendarr. Save it somewhere secure — it cannot be recovered.",
    "wizard.finish.title": "Setup Complete",
    "wizard.finish.detail":
      "Friendarr is ready. Next: create a download schedule to control when downloads run. Configure a friend library in Seerr to start sending requests.",
  };

  function fireReady() {
    window.dispatchEvent(
      new CustomEvent("translationsloaded", {
        detail: { locale: currentLocale },
      }),
    );
  }

  function loadLocale(locale) {
    if (loaded[locale]) return Promise.resolve(loaded[locale]);
    if (pending[locale]) return pending[locale];

    pending[locale] = fetch("/locales/" + locale + ".json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load locale: " + locale);
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
        console.warn("Failed to load locale " + locale + ":", err.message);
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
    localStorage.setItem("friendarr_language", lang);
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
