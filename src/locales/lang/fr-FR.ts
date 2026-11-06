/**
 * Français (French)
 * Traduction française complète.
 * Inscrit dans src/locales/locale.ts et répertorié dans src/constants/index.ts,
 * directement activable via `lhlocale.setLocale('fr-FR')`.
 */
export default {
  // Général
  common: {
    loading: 'Chargement',
  },
  // Champ de saisie
  input: {
    placeholder: 'Saisir',
    password: 'Mot de passe',
    clear: 'Effacer',
  },
  // Sélecteur de date (réservé)
  datepicker: {
    now: 'Maintenant',
    today: 'Aujourd’hui',
    prevMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    placeholder: 'Sélectionner une date',
    cancel: 'Annuler',
    clear: 'Effacer',
    confirm: 'OK',
    dateTableConfirm: 'Confirmer',
    dateTableDeConfirm: 'Pas pour l’instant',
    panelLabel: 'Sélectionner une date',
    monthPanelLabel: 'Sélectionner un mois',
    yearPanelLabel: 'Sélectionner une année',
    year: 'Année',
    month: 'Mois',
    // Titre du panneau calendaire : {month} est déjà un nom de mois (ex. « oct. »),
    // le modèle ne gère que l’ordre et le séparateur entre l’année et le mois
    panelTitle: '{month} {year}',
    month1: 'janv.',
    month2: 'févr.',
    month3: 'mars',
    month4: 'avr.',
    month5: 'mai',
    month6: 'juin',
    month7: 'juil.',
    month8: 'août',
    month9: 'sept.',
    month10: 'oct.',
    month11: 'nov.',
    month12: 'déc.',
    weeks: {
      sun: 'dim.',
      mon: 'lun.',
      tue: 'mar.',
      wed: 'mer.',
      thu: 'jeu.',
      fri: 'ven.',
      sat: 'sam.',
    },
    months: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  },
  // Sélecteur d’heure
  timepicker: {
    now: 'Maintenant',
    placeholder: 'Sélectionner l’heure',
    confirm: 'OK',
    cancel: 'Annuler',
    hour: 'h',
    minute: 'min',
    second: 's',
    panelLabel: 'Sélectionner l’heure',
    hourLabel: 'Heure',
    minuteLabel: 'Minute',
    secondLabel: 'Seconde',
  },
  // Sélecteur en cascade
  cascader: {
    noMatch: 'Aucune donnée correspondante',
    placeholder: 'Sélectionner',
    panelLabel: 'Sélectionner une option en cascade',
    columnLabel: 'Niveau {n}',
    filter: 'Rechercher',
  },
  // Étiquette
  tag: {
    close: 'Fermer',
  },
  // Badge
  badge: {
    other: 'Autres',
  },
  // Sélecteur
  select: {
    noMatch: 'Aucune donnée correspondante',
    noData: 'Aucune donnée',
    placeholder: 'Sélectionner',
    clear: 'Effacer',
    filter: 'Rechercher',
    empty: 'Aucune correspondance',
  },
  // Saisie semi-automatique
  autocomplete: {
    label: 'Saisie semi-automatique',
    noMatch: 'Aucune donnée correspondante',
    noData: 'Aucune donnée',
    placeholder: 'Saisir',
    clear: 'Effacer',
  },
  // Mentions
  mentions: {
    label: 'Mentions',
    noMatch: 'Aucun membre correspondant',
    placeholder: 'Saisissez @ pour mentionner quelqu\'un',
  },
  // Texte
  text: {
    copy: 'Copier',
    copied: 'Copié',
  },
  // 颜色选择器
  colorPicker: {
    label: 'Sélecteur de couleur',
    placeholder: 'Choisir une couleur',
    inputLabel: 'Valeur de couleur',
  },
  // 标签输入
  inputTag: {
    label: 'Saisie de tags',
    placeholder: 'Saisir un tag puis appuyer sur Entrée',
    removeTag: 'Supprimer le tag',
  },
  // Formulaire
  form: {
    validateFailed: 'Échec de la validation',
    required: 'Ce champ est obligatoire',
  },
  // Interrupteur
  switch: {
    on: 'Activé',
    off: 'Désactivé',
  },
  // Curseur
  slider: {
    range: 'Plage',
    thumb: 'Curseur',
    thumbStart: 'Curseur de début',
    thumbEnd: 'Curseur de fin',
  },
  // Barre de progression
  progress: {
    percent: '%',
  },
  // Avatar
  avatar: {
    icon: 'Icône utilisateur',
  },
  // Liste de descriptions
  descriptions: {
    operation: 'Opération',
  },
  // État vide
  empty: {
    description: 'Aucune donnée',
  },
  // Alerte
  alert: {
    close: 'Fermer l’alerte',
  },
  // Boîte de dialogue
  dialog: {
    close: 'Fermer la boîte de dialogue',
    confirm: 'OK',
    cancel: 'Annuler',
    ariaLabel: 'Boîte de dialogue',
  },
  // Message
  message: {
    close: 'Fermer le message',
  },
  // Fil d’Ariane
  breadcrumb: {
    label: 'Fil d’Ariane',
    more: 'Plus',
  },
  // Pagination
  pagination: {
    total: 'Total : {total} éléments',
    prev: 'Page précédente',
    next: 'Page suivante',
    page: 'Page {page}',
    goto: 'Aller à',
    pageSuffix: '',
    sizeChanger: '{size} / page',
    sizeChangerLabel: 'Éléments par page',
  },
  // Onglets
  tabs: {
    add: 'Ajouter un onglet',
  },
  // Étapes
  steps: {
    step: 'Étape {index}',
    finish: 'Terminé',
    error: 'Erreur',
  },
  // Bulle de confirmation
  popconfirm: {
    confirm: 'OK',
    cancel: 'Annuler',
  },
  // Tiroir
  drawer: {
    title: 'Tiroir',
    close: 'Fermer le tiroir',
  },
  // Notification
  notification: {
    close: 'Fermer la notification',
    closeAll: 'Tout fermer',
  },
  // Chargement
  loading: {
    text: 'Chargement…',
  },

  // Panneau repliable
  collapse: {
    toggle: 'Déplier ou replier {title}',
  },
  // Évaluation
  rate: {
    stars: '{n} étoiles',
  },
  // Retour en haut
  backtop: {
    label: 'Retour en haut',
  },
  // Image
  image: {
    preview: 'Aperçu de l’image',
    error: 'Échec du chargement',
    zoomIn: 'Agrandir',
    zoomOut: 'Réduire',
    rotate: 'Pivoter',
    prev: 'Précédent',
    next: 'Suivant',
    close: 'Fermer l’aperçu de l’image',
  },

  // Menu de navigation
  menu: {
    submenuLabel: 'Sous-menu {title}',
  },

  // Tableau
  table: {
    empty: 'Aucune donnée',
    filterTitle: 'Filtrer',
    filterConfirm: 'Appliquer',
    filterReset: 'Réinitialiser',
    resizeLabel: 'Redimensionner la colonne',
  },
  // Arbre
  tree: {
    empty: 'Aucune donnée',
  },
  // Sélecteur d’arborescence
  treeSelect: {
    triggerLabel: 'Sélecteur d’arborescence',
  },
  // Transfert
  transfer: {
    sourceTitle: 'Liste 1',
    targetTitle: 'Liste 2',
    moveRight: 'Déplacer vers la droite',
    moveLeft: 'Déplacer vers la gauche',
    searchPlaceholder: 'Saisir pour rechercher',
    empty: 'Aucune donnée',
  },
  // Téléversement
  upload: {
    select: 'Sélectionner un fichier',
    drag: 'Glissez les fichiers ici, ou cliquez pour téléverser',
    list: 'Liste des fichiers',
    remove: 'Supprimer',
    fail: 'Échec du téléversement',
    exceedSize: 'Le fichier dépasse la taille maximale',
    exceedCount: 'Nombre maximum de fichiers dépassé',
    rejectType: 'Type de fichier non autorisé',
  },
  // Navigation par ancres
  anchor: {
    label: 'Navigation par ancres',
  },

  // Textes d’accessibilité (aria-label / annonces des lecteurs d’écran,
  // utilisés par chaque couche UI via t('ariaLabels.xxx'))
  ariaLabels: {
    close: 'Fermer',
    expand: 'Déplier',
    collapse: 'Replier',
    clear: 'Effacer',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    openDropdown: 'Ouvrir la liste déroulante',
    closeDropdown: 'Réduire la liste déroulante',
    openDialog: 'Ouvrir la boîte de dialogue',
    closeDialog: 'Fermer la boîte de dialogue',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Réduire le menu',
    previous: 'Précédent',
    next: 'Suivant',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante',
    selectDate: 'Sélectionner une date',
    selectTime: 'Sélectionner l’heure',
    hour: 'Heure',
    minute: 'Minute',
    second: 'Seconde',
    page: 'Page {page}',
    currentPage: 'Page courante, page {page}',
    previousPage: 'Page précédente',
    nextPage: 'Page suivante',
    currentStep: 'Étape courante, étape {step} : {title}',
    step: 'Étape {step}',
    loading: 'Chargement',
    upload: 'Téléverser',
    uploading: 'Téléversement en cours',
    uploadSuccess: 'Téléversement réussi',
    uploadFailed: 'Échec du téléversement',
    removeFile: 'Supprimer le fichier',
    previewImage: 'Aperçu de l’image',
    previousImage: 'Image précédente',
    nextImage: 'Image suivante',
    zoomIn: 'Agrandir',
    zoomOut: 'Réduire',
    rotate: 'Pivoter',
    reset: 'Réinitialiser',
    switchOn: 'Activé',
    switchOff: 'Désactivé',
    rating: 'Évaluation',
    stars: '{n} étoiles',
    sortAscending: 'Tri croissant',
    sortDescending: 'Tri décroissant',
    sort: 'Trier',
    selectAll: 'Tout sélectionner',
    partialSelected: 'Sélection partielle',
    moveToTarget: 'Déplacer vers la liste cible',
    moveToSource: 'Déplacer vers la liste source',
    search: 'Rechercher',
    empty: 'Aucune donnée',
    saturation: 'Saturation',
    hue: 'Teinte',
    alpha: 'Opacité',
    removeTag: "Supprimer l'étiquette",
  },
} as const;
