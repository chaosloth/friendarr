import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "src", "ui", "locales");

const en = JSON.parse(
  fs.readFileSync(path.join(localesDir, "en.json"), "utf8"),
);

function base(overrides) {
  return { ...en, ...overrides };
}

// ─── Translations for each new locale ──────────────────────────────────────

const it = base({
  "apiKeys.close": "Chiudi",
  "apiKeys.copyToClipboard": "Copia negli appunti",
  "apiKeys.createKey": "Crea chiave",
  "apiKeys.created": "Chiave creata",
  "apiKeys.description":
    "Le chiavi API consentono ai servizi esterni (come Seerr) di autenticarsi con Friendarr e inviare lavori di download.",
  "apiKeys.label": "Etichetta",
  "apiKeys.newKey": "Nuova chiave API",
  "apiKeys.newKeyHint":
    "Assegna un nome facile da ricordare per sapere a cosa serve.",
  "apiKeys.noKeys": "Nessuna chiave API. Creane una per iniziare.",
  "apiKeys.revoke": "Revoca",
  "apiKeys.showKey": "Mostra chiave",
  "apiKeys.title": "Chiavi API",
  "apiKeys.unknownError": "Si è verificato un errore sconosciuto.",
  "auth.authenticate": "Autentica",
  "auth.authenticateToContinue":
    "Inserisci la tua chiave API master per continuare.",
  "auth.authenticateToManageSettings":
    "Autenticati per gestire le impostazioni",
  "auth.authenticateToViewQueue": "Autenticati per visualizzare la coda",
  "auth.authenticated": "Autenticato",
  "auth.connect": "Connetti",
  "auth.invalidKey": "Chiave API non valida",
  "auth.logout": "Esci",
  "auth.masterApiKey": "Chiave API master",
  "auth.modalDescription":
    "Inserisci la tua chiave API master per gestire la coda e le impostazioni.",
  "auth.modalTitle": "Autenticazione richiesta",
  "auth.notAuthenticated": "Non autenticato",
  "browse.failed": "Impossibile elencare il contenuto della directory.",
  "browse.noDirectories": "Nessuna directory trovata.",
  "browse.select": "Seleziona",
  "browse.title": "Sfoglia",
  "common.cancel": "Annulla",
  "common.failedToLoadSettings": "Impossibile caricare le impostazioni.",
  "common.save": "Salva",
  "display.language": "Lingua",
  "display.languageDescription":
    "Scegli la tua lingua preferita per l'interfaccia.",
  "display.title": "Visualizzazione",
  "event.download.complete": "Download completato",
  "event.download.failed": "Download fallito",
  "event.download.requested": "Download richiesto",
  "event.download.started": "Download avviato",
  "general.description":
    "Configura concorrenza, modalità test, logging e lingua.",
  "general.setupWizard": "Riavvia procedura guidata",
  "general.title": "Generale",
  "limits.bandwidthHint": "Imposta a 0 per illimitato.",
  "limits.description":
    "Configura concorrenza download, larghezza di banda e modalità test.",
  "limits.logLevel": "Livello di log",
  "limits.logLevelDescription":
    "Livello minimo di log per output console e buffer dei log.",
  "limits.maxBandwidth": "Larghezza di banda max (byte/sec)",
  "limits.maxConcurrent": "Download simultanei max",
  "limits.testMode": "Modalità test",
  "limits.testModeDescription":
    "Se attivato, i download vengono saltati e i lavori sono contrassegnati come completati immediatamente.",
  "limits.testModeEnabled":
    "La modalità test è attualmente attivata. I download vengono saltati.",
  "limits.title": "Limiti",
  "logs.all": "Tutti",
  "logs.autoRefresh": "Aggiornamento automatico",
  "logs.description": "Visualizza le voci di log recenti dal server.",
  "logs.failedToLoad": "Impossibile caricare i log.",
  "logs.loading": "Caricamento...",
  "logs.noEntries": "Nessuna voce di log.",
  "logs.title": "Log",
  "nav.queue": "Coda",
  "nav.settings": "Impostazioni",
  "page.queue": "Coda",
  "page.settings": "Impostazioni",
  "paths.browse": "Sfoglia",
  "paths.completed": "Percorso completati",
  "paths.completedHint":
    "Directory principale per i download multimediali completati.",
  "paths.description":
    "Configura dove vengono archiviati su disco i download incompleti e completati.",
  "paths.incomplete": "Percorso incompleti",
  "paths.incompleteHint": "Directory per i file attualmente in download.",
  "paths.movieDir": "Directory film",
  "paths.movieDirHint":
    "Dove vengono posizionati i film. Predefinito: {completedPath}/movies.",
  "paths.title": "Percorsi",
  "paths.tvDir": "Directory serie TV",
  "paths.tvDirHint":
    "Dove vengono posizionate le serie TV. Predefinito: {completedPath}/tv.",
  "queue.cancel": "Annulla",
  "queue.clearFinished": "Pulisci completati",
  "queue.column.actions": "Azioni",
  "queue.column.created": "Creato",
  "queue.column.size": "Dimensione",
  "queue.column.status": "Stato",
  "queue.column.title": "Titolo",
  "queue.column.type": "Tipo",
  "queue.failedToLoad": "Impossibile caricare la coda.",
  "queue.globallyPaused": "La coda è in pausa globale",
  "queue.noDownloads": "Nessun download in coda.",
  "queue.pause": "Pausa",
  "queue.pauseAll": "Pausa tutto",
  "queue.resumeAll": "Riprendi tutto",
  "queue.retry": "Riprova",
  "queue.stats.complete": "Completato",
  "queue.stats.downloading": "In download",
  "queue.stats.failed": "Fallito",
  "queue.stats.queued": "In coda",
  "schedules.addSchedule": "Aggiungi pianificazione",
  "schedules.addWindow": "Aggiungi finestra",
  "schedules.description":
    "Limita i download a giorni e finestre orarie specifici.",
  "schedules.end": "Fine",
  "schedules.fri": "Ven",
  "schedules.mon": "Lun",
  "schedules.remove": "Rimuovi",
  "schedules.sat": "Sab",
  "schedules.saveSchedule": "Salva pianificazione",
  "schedules.start": "Inizio",
  "schedules.sun": "Dom",
  "schedules.thu": "Gio",
  "schedules.title": "Pianificazioni",
  "schedules.tue": "Mar",
  "schedules.wed": "Mer",
  "settings.tab.apiKeys": "Chiavi API",
  "settings.tab.display": "Visualizzazione",
  "settings.tab.limits": "Limiti",
  "settings.tab.logs": "Log",
  "settings.tab.general": "Generale",
  "settings.tab.paths": "Percorsi",
  "settings.tab.schedules": "Pianificazioni",
  "settings.tab.webhooks": "Webhook",
  "status.complete": "Completato",
  "status.downloading": "In download",
  "status.failed": "Fallito",
  "status.queued": "In coda",
  "webhooks.active": "Attivo",
  "webhooks.addWebhook": "Aggiungi webhook",
  "webhooks.delete": "Elimina",
  "webhooks.description":
    "Configura webhook per ricevere notifiche per gli eventi di download.",
  "webhooks.disabled": "Disattivato",
  "webhooks.edit": "Modifica",
  "webhooks.editWebhook": "Modifica webhook",
  "webhooks.enabled": "Attivato",
  "webhooks.events": "Eventi",
  "webhooks.secret": "Segreto",
  "webhooks.secretHint":
    "Segreto opzionale per la verifica della firma del payload.",
  "webhooks.secretSet": "Il segreto è impostato",
  "webhooks.test": "Test",
  "webhooks.testSuccess": "Il test del webhook è riuscito.",
  "webhooks.title": "Webhook",
  "webhooks.url": "URL",
  "wizard.back": "Indietro",
  "wizard.finish": "Fine",
  "wizard.next": "Avanti",
  "wizard.skip": "Salta",
  "wizard.step1.description":
    "Scegli la tua lingua preferita per l'interfaccia.",
  "wizard.step1.title": "Passo 1: Lingua",
  "wizard.step2.description":
    "Genera la tua chiave API master. Questa chiave è necessaria per accedere alla dashboard.",
  "wizard.step2.keyHint":
    "Genera una chiave casuale sicura. Salvala in un luogo sicuro — non può essere recuperata.",
  "wizard.step2.keyLabel": "Chiave API",
  "wizard.step2.masterKeySet":
    "Una chiave master è configurata sul server. Inseriscila qui sotto per accedere alla dashboard.",
  "wizard.step2.noMasterKey":
    "Nessuna chiave API master è configurata. Generane una qui sotto, poi clicca su Attiva per salvarla.",
  "wizard.step2.activate": "Salva e attiva chiave",
  "wizard.step2.activating": "Attivazione...",
  "wizard.step2.title": "Passo 2: Imposta chiave API",
  "wizard.step2.authFailed":
    "Chiave master non valida. Controlla il tuo file .env e riprova.",
  "wizard.step3.completed": "Percorso completati",
  "wizard.step3.completedHint": "Directory principale per i media completati.",
  "wizard.step3.description":
    "Configura dove vengono archiviati i download incompleti e completati.",
  "wizard.step3.incomplete": "Percorso incompleti",
  "wizard.step3.incompleteHint":
    "Directory per i file attualmente in download.",
  "wizard.step3.title": "Passo 3: Posizioni",
  "wizard.step3.detail":
    "I file vengono scaricati prima nel percorso incompleto, poi collegati al percorso completato in caso di successo. Imposta directory separate per film e serie TV.",
  "wizard.step1.detail":
    "Friendarr supporta inglese, spagnolo, francese, tedesco, giapponese, cinese e portoghese.",
  "wizard.step2.detail":
    "Questa chiave è utilizzata da Seerr e altri client per autenticarsi con Friendarr. Salvala in un luogo sicuro — non può essere recuperata.",
  "wizard.finish.title": "Configurazione completata",
  "wizard.finish.detail":
    "Friendarr è pronto. Prossimo: crea una pianificazione di download per controllare quando i download vengono eseguiti. Configura una libreria amica in Seerr per iniziare a inviare richieste.",
});

const nl = base({
  "apiKeys.close": "Sluiten",
  "apiKeys.copyToClipboard": "Kopiëren naar klembord",
  "apiKeys.createKey": "Sleutel aanmaken",
  "apiKeys.created": "Sleutel aangemaakt",
  "apiKeys.description":
    "API-sleutels stellen externe diensten (zoals Seerr) in staat om te authenticeren bij Friendarr en downloadtaken in te dienen.",
  "apiKeys.label": "Label",
  "apiKeys.newKey": "Nieuwe API-sleutel",
  "apiKeys.newKeyHint":
    "Geef deze sleutel een gedenkwaardige naam zodat je weet waar hij voor is.",
  "apiKeys.noKeys": "Nog geen API-sleutels. Maak er een aan om te beginnen.",
  "apiKeys.revoke": "Intrekken",
  "apiKeys.showKey": "Toon sleutel",
  "apiKeys.title": "API-sleutels",
  "apiKeys.unknownError": "Er is een onbekende fout opgetreden.",
  "auth.authenticate": "Authenticeren",
  "auth.authenticateToContinue":
    "Voer je master API-sleutel in om door te gaan.",
  "auth.authenticateToManageSettings":
    "Authenticeer om instellingen te beheren",
  "auth.authenticateToViewQueue": "Authenticeer om de wachtrij te bekijken",
  "auth.authenticated": "Geauthenticeerd",
  "auth.connect": "Verbinden",
  "auth.invalidKey": "Ongeldige API-sleutel",
  "auth.logout": "Uitloggen",
  "auth.masterApiKey": "Master API-sleutel",
  "auth.modalDescription":
    "Voer je master API-sleutel in om de wachtrij en instellingen te beheren.",
  "auth.modalTitle": "Authenticatie vereist",
  "auth.notAuthenticated": "Niet geauthenticeerd",
  "browse.failed": "Kon directory-inhoud niet weergeven.",
  "browse.noDirectories": "Geen directories gevonden.",
  "browse.select": "Selecteren",
  "browse.title": "Bladeren",
  "common.cancel": "Annuleren",
  "common.failedToLoadSettings": "Kon instellingen niet laden.",
  "common.save": "Opslaan",
  "display.language": "Taal",
  "display.languageDescription": "Kies je voorkeurstaal voor de interface.",
  "display.title": "Weergave",
  "event.download.complete": "Download voltooid",
  "event.download.failed": "Download mislukt",
  "event.download.requested": "Download aangevraagd",
  "event.download.started": "Download gestart",
  "general.description":
    "Configureer gelijktijdigheid, testmodus, logging en taal.",
  "general.setupWizard": "Installatiewizard opnieuw uitvoeren",
  "general.title": "Algemeen",
  "limits.bandwidthHint": "Stel in op 0 voor onbeperkt.",
  "limits.description":
    "Configureer downloadgelijktijdigheid, bandbreedte en testmodus.",
  "limits.logLevel": "Logniveau",
  "limits.logLevelDescription":
    "Minimaal logniveau voor console-uitvoer en de logbuffer.",
  "limits.maxBandwidth": "Max bandbreedte (bytes/sec)",
  "limits.maxConcurrent": "Max gelijktijdige downloads",
  "limits.testMode": "Testmodus",
  "limits.testModeDescription":
    "Indien ingeschakeld, worden downloads overgeslagen en taken direct als voltooid gemarkeerd.",
  "limits.testModeEnabled":
    "Testmodus is momenteel ingeschakeld. Downloads worden overgeslagen.",
  "limits.title": "Limieten",
  "logs.all": "Alles",
  "logs.autoRefresh": "Automatisch vernieuwen",
  "logs.description": "Bekijk recente logvermeldingen van de server.",
  "logs.failedToLoad": "Kon logs niet laden.",
  "logs.loading": "Laden...",
  "logs.noEntries": "Geen logvermeldingen.",
  "logs.title": "Logs",
  "nav.queue": "Wachtrij",
  "nav.settings": "Instellingen",
  "page.queue": "Wachtrij",
  "page.settings": "Instellingen",
  "paths.browse": "Bladeren",
  "paths.completed": "Pad voltooide",
  "paths.completedHint": "Hoofdmap voor voltooide mediadownloads.",
  "paths.description":
    "Configureer waar onvoltooide en voltooide downloads op schijf worden opgeslagen.",
  "paths.incomplete": "Pad onvoltooide",
  "paths.incompleteHint": "Map voor bestanden die momenteel worden gedownload.",
  "paths.movieDir": "Filmmap",
  "paths.movieDirHint":
    "Waar films worden geplaatst. Standaard: {completedPath}/movies.",
  "paths.title": "Paden",
  "paths.tvDir": "TV-map",
  "paths.tvDirHint":
    "Waar tv-series worden geplaatst. Standaard: {completedPath}/tv.",
  "queue.cancel": "Annuleren",
  "queue.clearFinished": "Voltooide wissen",
  "queue.column.actions": "Acties",
  "queue.column.created": "Aangemaakt",
  "queue.column.size": "Grootte",
  "queue.column.status": "Status",
  "queue.column.title": "Titel",
  "queue.column.type": "Type",
  "queue.failedToLoad": "Kon wachtrij niet laden.",
  "queue.globallyPaused": "Wachtrij is globaal gepauzeerd",
  "queue.noDownloads": "Geen downloads in de wachtrij.",
  "queue.pause": "Pauzeren",
  "queue.pauseAll": "Alles pauzeren",
  "queue.resumeAll": "Alles hervatten",
  "queue.retry": "Opnieuw proberen",
  "queue.stats.complete": "Voltooid",
  "queue.stats.downloading": "Downloaden",
  "queue.stats.failed": "Mislukt",
  "queue.stats.queued": "In wachtrij",
  "schedules.addSchedule": "Schema toevoegen",
  "schedules.addWindow": "Venster toevoegen",
  "schedules.description":
    "Beperk downloads tot specifieke dagen en tijdvensters.",
  "schedules.end": "Einde",
  "schedules.fri": "Vrij",
  "schedules.mon": "Maa",
  "schedules.remove": "Verwijderen",
  "schedules.sat": "Zat",
  "schedules.saveSchedule": "Schema opslaan",
  "schedules.start": "Start",
  "schedules.sun": "Zon",
  "schedules.thu": "Don",
  "schedules.title": "Schema's",
  "schedules.tue": "Din",
  "schedules.wed": "Woe",
  "settings.tab.apiKeys": "API-sleutels",
  "settings.tab.display": "Weergave",
  "settings.tab.limits": "Limieten",
  "settings.tab.logs": "Logs",
  "settings.tab.general": "Algemeen",
  "settings.tab.paths": "Paden",
  "settings.tab.schedules": "Schema's",
  "settings.tab.webhooks": "Webhooks",
  "status.complete": "Voltooid",
  "status.downloading": "Downloaden",
  "status.failed": "Mislukt",
  "status.queued": "In wachtrij",
  "webhooks.active": "Actief",
  "webhooks.addWebhook": "Webhook toevoegen",
  "webhooks.delete": "Verwijderen",
  "webhooks.description":
    "Configureer webhooks om meldingen te ontvangen voor downloadgebeurtenissen.",
  "webhooks.disabled": "Uitgeschakeld",
  "webhooks.edit": "Bewerken",
  "webhooks.editWebhook": "Webhook bewerken",
  "webhooks.enabled": "Ingeschakeld",
  "webhooks.events": "Gebeurtenissen",
  "webhooks.secret": "Geheim",
  "webhooks.secretHint":
    "Optioneel geheim voor handtekeningverificatie van de payload.",
  "webhooks.secretSet": "Geheim is ingesteld",
  "webhooks.test": "Testen",
  "webhooks.testSuccess": "Webhooktest was succesvol.",
  "webhooks.title": "Webhooks",
  "webhooks.url": "URL",
  "wizard.back": "Terug",
  "wizard.finish": "Voltooien",
  "wizard.next": "Volgende",
  "wizard.skip": "Overslaan",
  "wizard.step1.description": "Kies je voorkeurstaal voor de interface.",
  "wizard.step1.title": "Stap 1: Taal",
  "wizard.step2.description":
    "Genereer je master API-sleutel. Deze sleutel is vereist om toegang te krijgen tot het dashboard.",
  "wizard.step2.keyHint":
    "Genereer een sterke willekeurige sleutel. Bewaar deze veilig — hij kan niet worden hersteld.",
  "wizard.step2.keyLabel": "API-sleutel",
  "wizard.step2.masterKeySet":
    "Er is een hoofdsleutel geconfigureerd op de server. Voer deze hieronder in om toegang te krijgen tot het dashboard.",
  "wizard.step2.noMasterKey":
    "Geen master API-sleutel geconfigureerd. Genereer er hieronder een en klik op Activeren om hem op te slaan.",
  "wizard.step2.activate": "Sleutel opslaan en activeren",
  "wizard.step2.activating": "Activeren...",
  "wizard.step2.title": "Stap 2: API-sleutel instellen",
  "wizard.step2.authFailed":
    "Ongeldige hoofdsleutel. Controleer je .env-bestand en probeer opnieuw.",
  "wizard.step3.completed": "Pad voltooide",
  "wizard.step3.completedHint": "Hoofdmap voor voltooide media.",
  "wizard.step3.description":
    "Configureer waar onvoltooide en voltooide downloads worden opgeslagen.",
  "wizard.step3.incomplete": "Pad onvoltooide",
  "wizard.step3.incompleteHint":
    "Map voor bestanden die momenteel worden gedownload.",
  "wizard.step3.title": "Stap 3: Locaties",
  "wizard.step3.detail":
    "Bestanden downloaden eerst naar het onvoltooide pad en worden bij succes gekoppeld aan het voltooide pad. Stel aparte mappen in voor films en tv-series.",
  "wizard.step1.detail":
    "Friendarr ondersteunt Engels, Spaans, Frans, Duits, Japans, Chinees en Portugees.",
  "wizard.step2.detail":
    "Deze sleutel wordt gebruikt door Seerr en andere clients om te authenticeren bij Friendarr. Bewaar deze veilig — hij kan niet worden hersteld.",
  "wizard.finish.title": "Installatie voltooid",
  "wizard.finish.detail":
    "Friendarr is klaar. Volgende: maak een downloadschema om te bepalen wanneer downloads worden uitgevoerd. Configureer een vriendbibliotheek in Seerr om verzoeken te verzenden.",
});

// ─── All locale codes matching Seerr ───────────────────────────────────────

const allLocales = [
  "ar",
  "bg",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es-MX",
  "es",
  "et",
  "eu",
  "fi",
  "fr",
  "he",
  "hi",
  "hr",
  "hu",
  "it",
  "ja",
  "kab",
  "ko",
  "lb",
  "lt",
  "nb-NO",
  "nl",
  "pl",
  "pt-BR",
  "pt-PT",
  "ro",
  "ru",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "tr",
  "uk",
  "vi",
  "zh-Hans",
  "zh-Hant",
];

// Language display names
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

// Languages that we have specific translations for (not just English fallback)
const haveTranslations = new Set([
  "en",
  "es",
  "es-MX",
  "fr",
  "de",
  "ja",
  "zh-Hans",
  "pt-BR",
  "it",
  "nl",
]);

const havePartial = new Set(["zh-Hant", "pt-PT"]);

// Generate all locale files
for (const locale of allLocales) {
  let data;

  if (locale === "es-MX") {
    data = JSON.parse(
      fs.readFileSync(path.join(localesDir, "es.json"), "utf8"),
    );
  } else if (locale === "es") {
    // Already exists
    continue;
  } else if (locale === "en") {
    // Already exists
    continue;
  } else if (locale === "fr") {
    continue;
  } else if (locale === "de") {
    continue;
  } else if (locale === "ja") {
    continue;
  } else if (locale === "zh-Hans") {
    continue;
  } else if (locale === "pt-BR") {
    continue;
  } else if (locale === "it") {
    data = it;
  } else if (locale === "nl") {
    data = nl;
  } else if (locale === "zh-Hant") {
    data = JSON.parse(
      fs.readFileSync(path.join(localesDir, "zh-Hans.json"), "utf8"),
    );
    // Convert simplified -> traditional (minimal key adjustments)
    // We'll create a separate mapping in a second pass
  } else if (locale === "pt-PT") {
    data = JSON.parse(
      fs.readFileSync(path.join(localesDir, "pt-BR.json"), "utf8"),
    );
  } else {
    // Default: start with English
    data = { ...en };
  }

  fs.writeFileSync(
    path.join(localesDir, `${locale}.json`),
    JSON.stringify(data, null, 2) + "\n",
  );
  console.log(`Wrote ${locale}.json (${Object.keys(data).length} keys)`);
}

// Write LANGUAGES manifest
const manifest = {};
for (const locale of allLocales) {
  manifest[locale] = langNames[locale] || locale;
}
fs.writeFileSync(
  path.join(localesDir, "_languages.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log("Wrote _languages.json");
console.log("Done.");
