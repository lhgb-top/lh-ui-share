/**
 * Deutsch (German)
 * Vollständige deutsche Übersetzung.
 * Registriert in src/locales/locale.ts, gelistet in src/constants/index.ts,
 * direkt per `lhlocale.setLocale('de-DE')` umschaltbar.
 */
export default {
  // Allgemein
  common: {
    loading: 'Wird geladen',
  },
  // Eingabe
  input: {
    placeholder: 'Bitte eingeben',
    password: 'Passwort',
    clear: 'Leeren',
  },
  // Datepicker (reserviert)
  datepicker: {
    now: 'Jetzt',
    today: 'Heute',
    prevMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    placeholder: 'Datum auswählen',
    cancel: 'Abbrechen',
    clear: 'Leeren',
    confirm: 'OK',
    dateTableConfirm: 'Bestätigen',
    dateTableDeConfirm: 'Vorläufig offen',
    panelLabel: 'Datum auswählen',
    monthPanelLabel: 'Monat auswählen',
    yearPanelLabel: 'Jahr auswählen',
    year: 'J',
    month: 'M',
    // Kalenderpanel-Titel: {month} ist bereits ein Monatsname wie 'Okt.', die Vorlage bestimmt nur Reihenfolge und Verknüpfung von Jahr und Monat
    panelTitle: '{month} {year}',
    month1: 'Jan.',
    month2: 'Feb.',
    month3: 'März',
    month4: 'Apr.',
    month5: 'Mai',
    month6: 'Juni',
    month7: 'Juli',
    month8: 'Aug.',
    month9: 'Sept.',
    month10: 'Okt.',
    month11: 'Nov.',
    month12: 'Dez.',
    weeks: {
      sun: 'So',
      mon: 'Mo',
      tue: 'Di',
      wed: 'Mi',
      thu: 'Do',
      fri: 'Fr',
      sat: 'Sa',
    },
    months: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
  },
  // TimePicker
  timepicker: {
    now: 'Jetzt',
    placeholder: 'Zeit auswählen',
    confirm: 'OK',
    cancel: 'Abbrechen',
    hour: 'h',
    minute: 'm',
    second: 's',
    panelLabel: 'Zeit auswählen',
    hourLabel: 'Stunde',
    minuteLabel: 'Minute',
    secondLabel: 'Sekunde',
  },
  // Cascader
  cascader: {
    noMatch: 'Keine passenden Daten',
    placeholder: 'Bitte auswählen',
    panelLabel: 'Kaskadenoption auswählen',
    columnLabel: 'Ebene {n}',
    filter: 'Suchen',
  },
  // Tag
  tag: {
    close: 'Schließen',
  },
  // Badge
  badge: {
    other: 'Sonstige',
  },
  // Select
  select: {
    noMatch: 'Keine passenden Daten',
    noData: 'Keine Daten',
    placeholder: 'Bitte auswählen',
    clear: 'Leeren',
    filter: 'Suchen',
    empty: 'Keine Treffer',
  },
  // Autovervollständigung
  autocomplete: {
    label: 'Autovervollständigung',
    noMatch: 'Keine passenden Daten',
    noData: 'Keine Daten',
    placeholder: 'Bitte eingeben',
    clear: 'Leeren',
  },
  // Erwähnungen
  mentions: {
    label: 'Erwähnungen',
    noMatch: 'Keine passenden Mitglieder',
    placeholder: 'Tippen Sie @, um jemanden zu erwähnen',
  },
  // Text
  text: {
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
  // 颜色选择器
  colorPicker: {
    label: 'Farbauswahl',
    placeholder: 'Farbe auswählen',
    inputLabel: 'Farbwert',
  },
  // 标签输入
  inputTag: {
    label: 'Tag-Eingabe',
    placeholder: 'Tag eingeben und Enter drücken',
    removeTag: 'Tag entfernen',
  },
  // Formular
  form: {
    validateFailed: 'Validierung fehlgeschlagen',
    required: 'Dieses Feld ist erforderlich',
  },
  // Switch
  switch: {
    on: 'Ein',
    off: 'Aus',
  },
  // Slider
  slider: {
    range: 'Bereich',
    thumb: 'Schieber',
    thumbStart: 'Startschieber',
    thumbEnd: 'Endschieber',
  },
  // Progress
  progress: {
    percent: '%',
  },
  // Avatar
  avatar: {
    icon: 'Benutzersymbol',
  },
  // Beschreibungen
  descriptions: {
    operation: 'Aktion',
  },
  // Leer
  empty: {
    description: 'Keine Daten',
  },
  // Hinweis
  alert: {
    close: 'Hinweis schließen',
  },
  // Dialog
  dialog: {
    close: 'Dialog schließen',
    confirm: 'OK',
    cancel: 'Abbrechen',
    ariaLabel: 'Dialogfeld',
  },
  // Nachricht
  message: {
    close: 'Nachricht schließen',
  },
  // Breadcrumb
  breadcrumb: {
    label: 'Breadcrumb-Navigation',
    more: 'Mehr',
  },
  // Paginierung
  pagination: {
    total: 'Gesamt: {total}',
    prev: 'Vorherige Seite',
    next: 'Nächste Seite',
    page: 'Seite {page}',
    goto: 'Gehe zu',
    pageSuffix: 'Seite',
    sizeChanger: '{size} / Seite',
    sizeChangerLabel: 'Einträge pro Seite',
  },
  // Tabs
  tabs: {
    add: 'Tab hinzufügen',
  },
  // Schritte
  steps: {
    step: 'Schritt {index}',
    finish: 'Abgeschlossen',
    error: 'Fehler',
  },
  // Popconfirm
  popconfirm: {
    confirm: 'OK',
    cancel: 'Abbrechen',
  },
  // Drawer
  drawer: {
    title: 'Drawer',
    close: 'Drawer schließen',
  },
  // Benachrichtigung
  notification: {
    close: 'Benachrichtigung schließen',
    closeAll: 'Alle schließen',
  },
  // Loading
  loading: {
    text: 'Wird geladen…',
  },

  // Collapse
  collapse: {
    toggle: '{title} ausklappen oder einklappen',
  },
  // Bewertung
  rate: {
    stars: '{n} Sterne',
  },
  // BackTop
  backtop: {
    label: 'Nach oben',
  },
  // Bild
  image: {
    preview: 'Bildvorschau',
    error: 'Laden fehlgeschlagen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    rotate: 'Drehen',
    prev: 'Vorheriges',
    next: 'Nächstes',
    close: 'Bildvorschau schließen',
  },

  // Menü
  menu: {
    submenuLabel: 'Untermenü {title}',
  },

  // Tabelle
  table: {
    empty: 'Keine Daten',
    filterTitle: 'Filtern',
    filterConfirm: 'Übernehmen',
    filterReset: 'Zurücksetzen',
    resizeLabel: 'Spaltenbreite anpassen',
  },
  // Baum
  tree: {
    empty: 'Keine Daten',
  },
  // TreeSelect
  treeSelect: {
    triggerLabel: 'Baumauswahl',
  },
  // Transfer
  transfer: {
    sourceTitle: 'Liste 1',
    targetTitle: 'Liste 2',
    moveRight: 'Nach rechts verschieben',
    moveLeft: 'Nach links verschieben',
    searchPlaceholder: 'Suchbegriff eingeben',
    empty: 'Keine Daten',
  },
  // Upload
  upload: {
    select: 'Datei auswählen',
    drag: 'Dateien hierher ziehen oder klicken zum Hochladen',
    list: 'Dateiliste',
    remove: 'Entfernen',
    fail: 'Hochladen fehlgeschlagen',
    exceedSize: 'Datei überschreitet die Größenbeschränkung',
    exceedCount: 'Anzahlbeschränkung überschritten',
    rejectType: 'Dateityp nicht erlaubt',
  },
  // Anker
  anchor: {
    label: 'Anker-Navigation',
  },

  // Barrierefreiheitstexte (aria-label / Bildschirmlese-Ansagen, für die UI-Schichten über t('ariaLabels.xxx'))
  ariaLabels: {
    close: 'Schließen',
    expand: 'Ausklappen',
    collapse: 'Einklappen',
    clear: 'Leeren',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    openDropdown: 'Dropdown öffnen',
    closeDropdown: 'Dropdown schließen',
    openDialog: 'Dialog öffnen',
    closeDialog: 'Dialog schließen',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    previous: 'Vorheriges',
    next: 'Nächstes',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    previousYear: 'Vorheriges Jahr',
    nextYear: 'Nächstes Jahr',
    selectDate: 'Datum auswählen',
    selectTime: 'Zeit auswählen',
    hour: 'Stunde',
    minute: 'Minute',
    second: 'Sekunde',
    page: 'Seite {page}',
    currentPage: 'Aktuelle Seite, Seite {page}',
    previousPage: 'Vorherige Seite',
    nextPage: 'Nächste Seite',
    currentStep: 'Aktueller Schritt, Schritt {step}: {title}',
    step: 'Schritt {step}',
    loading: 'Wird geladen',
    upload: 'Hochladen',
    uploading: 'Wird hochgeladen',
    uploadSuccess: 'Hochladen erfolgreich',
    uploadFailed: 'Hochladen fehlgeschlagen',
    removeFile: 'Datei entfernen',
    previewImage: 'Bildvorschau',
    previousImage: 'Vorheriges Bild',
    nextImage: 'Nächstes Bild',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    rotate: 'Drehen',
    reset: 'Zurücksetzen',
    switchOn: 'Eingeschaltet',
    switchOff: 'Ausgeschaltet',
    rating: 'Bewertung',
    stars: '{n} Sterne',
    sortAscending: 'Aufsteigend sortieren',
    sortDescending: 'Absteigend sortieren',
    sort: 'Sortieren',
    selectAll: 'Alle auswählen',
    partialSelected: 'Teilweise ausgewählt',
    moveToTarget: 'Nach rechts verschieben',
    moveToSource: 'Nach links verschieben',
    search: 'Suchen',
    empty: 'Keine Daten',
    saturation: 'Sättigung',
    hue: 'Farbton',
    alpha: 'Deckkraft',
    removeTag: 'Tag entfernen',
  },
} as const;
