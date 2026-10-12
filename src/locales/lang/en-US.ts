export default {
  // General
  common: {
    loading: 'Loading',
  },
  // Input
  input: {
    placeholder: 'Please input',
    password: 'Password',
  },
  // Datepicker (reserved)
  datepicker: {
    now: 'Now',
    today: 'Today',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    placeholder: 'Select date',
    cancel: 'Cancel',
    clear: 'Clear',
    confirm: 'OK',
    dateTableConfirm: 'Confirm',
    dateTableDeConfirm: 'Temporarily',
    panelLabel: 'Select date',
    monthPanelLabel: 'Select month',
    yearPanelLabel: 'Select year',
    year: 'Y',
    month: 'M',
    // 日历面板标题：{month} 已是 'Oct' 这类月名，模板只负责年和月的顺序与连接符
    panelTitle: '{month} {year}',
    month1: 'Jan',
    month2: 'Feb',
    month3: 'Mar',
    month4: 'Apr',
    month5: 'May',
    month6: 'Jun',
    month7: 'Jul',
    month8: 'Aug',
    month9: 'Sep',
    month10: 'Oct',
    month11: 'Nov',
    month12: 'Dec',
    weeks: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  // TimePicker
  timepicker: {
    now: 'Now',
    placeholder: 'Select time',
    confirm: 'OK',
    cancel: 'Cancel',
    hour: 'H',
    minute: 'M',
    second: 'S',
    panelLabel: 'Select time',
    hourLabel: 'Hour',
    minuteLabel: 'Minute',
    secondLabel: 'Second',
  },
  // Cascader
  cascader: {
    noMatch: 'No matching data',
    placeholder: 'Please select',
    panelLabel: 'Select cascade option',
    columnLabel: 'Level {n}',
  },
  // Tag
  tag: {
    close: 'Close',
  },
  // Badge
  badge: {
    other: 'Others',
  },
  // Select
  select: {
    noMatch: 'No matching data',
    noData: 'No data',
    placeholder: 'Please select',
  },
  // Form
  form: {
    validateFailed: 'Validation failed',
    required: 'This field is required',
  },
  // Switch
  switch: {
    on: 'On',
    off: 'Off',
  },
  // Slider
  slider: {
    range: 'Range',
    thumb: 'Slider',
    thumbStart: 'Start slider',
    thumbEnd: 'End slider',
  },
  // Progress
  progress: {
    percent: '%',
  },
  // Avatar
  avatar: {
    icon: 'User icon',
  },
  // Descriptions
  descriptions: {
    operation: 'Operation',
  },
  // Dialog
  dialog: {
    close: 'Close dialog',
  },
  // Message
  message: {
    close: 'Close message',
  },
  // Empty
  empty: {
    description: 'No data',
  },
  // Alert
  alert: {
    close: 'Dismiss alert',
  },
  // Breadcrumb
  breadcrumb: {
    label: 'Breadcrumb',
    more: 'More',
  },
  // Pagination
  pagination: {
    total: 'Total {total} items',
    prev: 'Previous page',
    next: 'Next page',
    page: 'Page {page}',
    goto: 'Go to',
    pageSuffix: '',
    sizeChanger: '{size} / page',
    sizeChangerLabel: 'Items per page',
  },
  // Tabs
  tabs: {
    add: 'Add tab',
  },
  // Steps
  steps: {
    step: 'Step {index}',
    finish: 'Completed',
    error: 'Error',
  },
  // Popconfirm
  popconfirm: {
    confirm: 'OK',
    cancel: 'Cancel',
  },
  // Drawer
  drawer: {
    title: 'Drawer',
    close: 'Close drawer',
  },
  // Notification
  notification: {
    close: 'Close notification',
    closeAll: 'Close all',
  },
  // Loading
  loading: {
    text: 'Loading…',
  },

  // Collapse
  collapse: {
    toggle: 'Toggle {title}',
  },
  // Rate
  rate: {
    stars: '{n} stars',
  },
  // BackTop
  backtop: {
    label: 'Back to top',
  },
  // Image
  image: {
    preview: 'Preview image',
    error: 'Failed to load',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    rotate: 'Rotate',
    prev: 'Previous',
    next: 'Next',
    close: 'Close image preview',
  },

  // Menu
  menu: {
    submenuLabel: 'Submenu {title}',
  },

  // Table
  table: {
    empty: 'No data',
    filterTitle: 'Filter',
    filterConfirm: 'Confirm',
    filterReset: 'Reset',
    resizeLabel: 'Resize column',
  },
  // Tree
  tree: {
    empty: 'No data',
  },
  // TreeSelect
  treeSelect: {
    triggerLabel: 'Tree select',
  },
  // Transfer
  transfer: {
    sourceTitle: 'List 1',
    targetTitle: 'List 2',
    moveRight: 'Move right',
    moveLeft: 'Move left',
    searchPlaceholder: 'Search',
    empty: 'No data',
  },
  // Upload
  upload: {
    select: 'Select file',
    drag: 'Drop files here or click to upload',
    list: 'File list',
    remove: 'Remove',
    fail: 'Upload failed',
    exceedSize: 'File exceeds the size limit',
    exceedCount: 'Exceeds the count limit',
    rejectType: 'File type not allowed',
  },
  // Anchor
  anchor: {
    label: 'Anchor navigation',
  },

  // Accessibility labels (aria-label / screen reader announcements)
  ariaLabels: {
    close: 'Close',
    expand: 'Expand',
    collapse: 'Collapse',
    clear: 'Clear',
    confirm: 'Confirm',
    cancel: 'Cancel',
    openDropdown: 'Open dropdown',
    closeDropdown: 'Close dropdown',
    openDialog: 'Open dialog',
    closeDialog: 'Close dialog',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    previous: 'Previous',
    next: 'Next',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    selectDate: 'Select date',
    selectTime: 'Select time',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    page: 'Page {page}',
    currentPage: 'Current page, page {page}',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    currentStep: 'Current step, step {step}: {title}',
    step: 'Step {step}',
    loading: 'Loading',
    upload: 'Upload',
    uploading: 'Uploading',
    uploadSuccess: 'Upload succeeded',
    uploadFailed: 'Upload failed',
    removeFile: 'Remove file',
    previewImage: 'Preview image',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    rotate: 'Rotate',
    reset: 'Reset',
    switchOn: 'On',
    switchOff: 'Off',
    rating: 'Rating',
    stars: '{n} stars',
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    sort: 'Sort',
    selectAll: 'Select all',
    partialSelected: 'Partially selected',
    moveToTarget: 'Move to target',
    moveToSource: 'Move to source',
    search: 'Search',
    empty: 'No data',
  },
} as const;