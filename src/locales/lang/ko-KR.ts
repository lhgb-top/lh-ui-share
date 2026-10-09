/**
 * 한국어 (Korean)
 * 当前为骨架文件，默认使用英文作为兜底翻译。
 * 已在 src/locales/locale.ts 注册、src/constants/index.ts 登记，
 * 可直接 `lhlocale.setLocale('ko-KR')` 切换（当前返回英文兜底文案，翻译补全后生效）。
 */
export default {
  common: { loading: 'Loading' },
  input: { placeholder: 'Please input', password: 'Password' },
  datepicker: { now: 'Now', today: 'Today', prevMonth: 'Previous month', nextMonth: 'Next month', placeholder: 'Select date', cancel: 'Cancel', clear: 'Clear', confirm: 'OK', dateTableConfirm: 'Confirm', dateTableDeConfirm: 'Temporarily', year: 'Y', month: 'M', month1: 'Jan', month2: 'Feb', month3: 'Mar', month4: 'Apr', month5: 'May', month6: 'Jun', month7: 'Jul', month8: 'Aug', month9: 'Sep', month10: 'Oct', month11: 'Nov', month12: 'Dec', weeks: { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }, months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  timepicker: { now: 'Now', placeholder: 'Select time', confirm: 'OK', cancel: 'Cancel', hour: 'H', minute: 'M', second: 'S' },
  cascader: { noMatch: 'No matching data', placeholder: 'Please select' },
  tag: { close: 'Close' },
  badge: { other: 'Others' },
  select: { noMatch: 'No matching data', noData: 'No data', placeholder: 'Please select' },
  form: { validateFailed: 'Validation failed', required: 'This field is required' },
  switch: { on: 'On', off: 'Off' },
  slider: { range: 'Range' },
  progress: { percent: '%' },
  avatar: { icon: 'User icon' },
  descriptions: { operation: 'Operation' },
  dialog: { close: 'Close dialog' },
  message: { close: 'Close message' },
  empty: { description: 'No data' },
  alert: { close: 'Dismiss alert' },
  breadcrumb: { label: 'Breadcrumb', more: 'More' },
  pagination: { total: 'Total {total} items', prev: 'Previous page', next: 'Next page', page: 'Page {page}', goto: 'Go to', pageSuffix: '', sizeChanger: '{size} / page', sizeChangerLabel: 'Items per page' },
  tabs: { add: 'Add tab' },
  steps: { step: 'Step {index}', finish: 'Completed', error: 'Error' },
  popconfirm: { confirm: 'OK', cancel: 'Cancel' },
  drawer: { title: 'Drawer', close: 'Close drawer' },
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
    filterTitle: '필터',
    filterConfirm: '확인',
    filterReset: '초기화',
    resizeLabel: '열 너비 조정',
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
  // 骨架文件：默认使用英文兜底，翻译补全后生效
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