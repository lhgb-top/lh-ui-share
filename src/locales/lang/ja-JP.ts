/**
 * 日本語 (Japanese)
 * 当前为骨架文件，默认使用英文作为兜底翻译。
 * 启用步骤：取消 packages/constants/index.ts 中 jaJP 的注释
 */
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
  // Datepicker
  datepicker: {
    now: 'Now',
    today: 'Today',
    cancel: 'Cancel',
    clear: 'Clear',
    confirm: 'OK',
    dateTableConfirm: 'Confirm',
    dateTableDeConfirm: 'Temporarily',
    year: 'Y',
    month: 'M',
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
    confirm: 'OK',
    cancel: 'Cancel',
    hour: 'H',
    minute: 'M',
    second: 'S',
  },
  // Cascader
  cascader: {
    noMatch: 'No matching data',
    placeholder: 'Please select',
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
  },

  // Menu
  menu: {
    submenuLabel: 'Submenu {title}',
  },

  // Table
  table: {
    empty: 'No data',
    filterTitle: 'フィルター',
    filterConfirm: '確認',
    filterReset: 'リセット',
    resizeLabel: '列幅を調整',
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
} as const;