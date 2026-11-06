/**
 * العربية: ترجمة كاملة (RTL)
 * هذه اللغة من اليمين إلى اليسار، ويجب ضبط اتجاه الصفحة عبر `<html dir="rtl">`
 * (تتكفّل آلية كل موقع بحقنه، انظر docs/i18n/glossary.md §四).
 */
export default {
  // عام
  common: {
    loading: 'جارٍ التحميل',
  },
  // مكوّنات الإدخال
  input: {
    placeholder: 'الرجاء الإدخال',
    password: 'كلمة المرور',
    clear: 'مسح',
  },
  // منتقي التاريخ (محجوز)
  datepicker: {
    now: 'الآن',
    today: 'اليوم',
    prevMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي',
    placeholder: 'الرجاء اختيار التاريخ',
    cancel: 'إلغاء',
    clear: 'مسح',
    confirm: 'تأكيد',
    dateTableConfirm: 'تأكيد',
    dateTableDeConfirm: 'غير مؤكد مؤقتًا',
    panelLabel: 'اختيار التاريخ',
    monthPanelLabel: 'اختيار الشهر',
    yearPanelLabel: 'اختيار السنة',
    year: 'السنة',
    month: 'الشهر',
    // عنوان لوحة التقويم: {month} هو اسم شهر مثل «أكتوبر»، يتحكّم القالب فقط في ترتيب السنة والشهر وفاصلهما
    panelTitle: '{month} {year}',
    month1: 'يناير',
    month2: 'فبراير',
    month3: 'مارس',
    month4: 'أبريل',
    month5: 'مايو',
    month6: 'يونيو',
    month7: 'يوليو',
    month8: 'أغسطس',
    month9: 'سبتمبر',
    month10: 'أكتوبر',
    month11: 'نوفمبر',
    month12: 'ديسمبر',
    weeks: {
      sun: 'الأحد',
      mon: 'الإثنين',
      tue: 'الثلاثاء',
      wed: 'الأربعاء',
      thu: 'الخميس',
      fri: 'الجمعة',
      sat: 'السبت',
    },
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  },
  // منتقي الوقت
  timepicker: {
    now: 'الآن',
    placeholder: 'الرجاء اختيار الوقت',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    hour: 'الساعة',
    minute: 'الدقيقة',
    second: 'الثانية',
    panelLabel: 'اختيار الوقت',
    hourLabel: 'ساعة',
    minuteLabel: 'دقيقة',
    secondLabel: 'ثانية',
  },
  // الاختيار المتسلسل
  cascader: {
    noMatch: 'لا توجد بيانات مطابقة',
    placeholder: 'الرجاء الاختيار',
    panelLabel: 'الرجاء اختيار خيار متسلسل',
    columnLabel: 'المستوى {n}',
    filter: 'بحث',
  },
  // الوسم
  tag: {
    close: 'إغلاق',
  },
  // الشارة
  badge: {
    other: 'أخرى',
  },
  // المُنتقي
  select: {
    noMatch: 'لا توجد بيانات مطابقة',
    noData: 'لا توجد بيانات',
    placeholder: 'الرجاء الاختيار',
    clear: 'مسح',
    filter: 'بحث',
    empty: 'لا تطابق',
  },
  // الإكمال التلقائي
  autocomplete: {
    label: 'الإكمال التلقائي',
    noMatch: 'لا توجد بيانات مطابقة',
    noData: 'لا توجد بيانات',
    placeholder: 'أدخل',
    clear: 'مسح',
  },
  // الإشارات
  mentions: {
    label: 'الإشارات',
    noMatch: 'لا يوجد أعضاء مطابقون',
    placeholder: 'اكتب @ لذكر شخص ما',
  },
  // النص
  text: {
    copy: 'نسخ',
    copied: 'تم النسخ',
  },
  // 颜色选择器
  colorPicker: {
    label: 'منتقي الألوان',
    placeholder: 'اختر اللون',
    inputLabel: 'قيمة اللون',
  },
  // 标签输入
  inputTag: {
    label: 'إدخال الوسوم',
    placeholder: 'أدخل وسمًا ثم اضغط Enter',
    removeTag: 'حذف الوسم',
  },
  // النموذج
  form: {
    validateFailed: 'فشل التحقق',
    required: 'هذا الحقل مطلوب',
  },
  // مفتاح التبديل
  switch: {
    on: 'مفعّل',
    off: 'غير مفعّل',
  },
  // المنزلق
  slider: {
    range: 'النطاق',
    thumb: 'المنزلق',
    thumbStart: 'المنزلق الأول',
    thumbEnd: 'المنزلق الأخير',
  },
  // شريط التقدّم
  progress: {
    percent: '%',
  },
  // الصورة الرمزية
  avatar: {
    icon: 'أيقونة المستخدم',
  },
  // قائمة الوصف
  descriptions: {
    operation: 'العملية',
  },
  // الحالة الفارغة
  empty: {
    description: 'لا توجد بيانات',
  },
  // تنبيه
  alert: {
    close: 'إغلاق التنبيه',
  },
  // مربع الحوار
  dialog: {
    close: 'إغلاق مربع الحوار',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    ariaLabel: 'مربع الحوار',
  },
  // رسالة
  message: {
    close: 'إغلاق الرسالة',
  },
  // مسار التنقل
  breadcrumb: {
    label: 'مسار التنقل',
    more: 'المزيد',
  },
  // ترقيم الصفحات
  pagination: {
    total: 'إجمالي {total} عنصرًا',
    prev: 'الصفحة السابقة',
    next: 'الصفحة التالية',
    page: 'الصفحة {page}',
    goto: 'انتقل إلى',
    pageSuffix: 'صفحة',
    sizeChanger: '{size} عنصرًا لكل صفحة',
    sizeChangerLabel: 'العناصر لكل صفحة',
  },
  // علامات التبويب
  tabs: {
    add: 'إضافة علامة تبويب',
  },
  // خطوات
  steps: {
    step: 'الخطوة {index}',
    finish: 'مكتمل',
    error: 'خطأ',
  },
  // تأكيد منبثق
  popconfirm: {
    confirm: 'تأكيد',
    cancel: 'إلغاء',
  },
  // الدرج
  drawer: {
    title: 'الدرج',
    close: 'إغلاق الدرج',
  },
  // الإشعارات
  notification: {
    close: 'إغلاق الإشعار',
    closeAll: 'إغلاق الكل',
  },
  // التحميل
  loading: {
    text: 'جارٍ التحميل…',
  },

  // لوحة قابلة للطي
  collapse: {
    toggle: 'توسيع أو طي {title}',
  },
  // التقييم
  rate: {
    stars: '{n} نجوم',
  },
  // العودة إلى الأعلى
  backtop: {
    label: 'العودة إلى الأعلى',
  },
  // الصورة
  image: {
    preview: 'معاينة الصورة',
    error: 'فشل التحميل',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    rotate: 'تدوير',
    prev: 'السابقة',
    next: 'التالية',
    close: 'إغلاق معاينة الصورة',
  },

  // قائمة التنقل
  menu: {
    submenuLabel: 'القائمة الفرعية {title}',
  },

  // الجدول
  table: {
    empty: 'لا توجد بيانات',
    filterTitle: 'تصفية',
    filterConfirm: 'تأكيد',
    filterReset: 'إعادة تعيين',
    resizeLabel: 'تغيير عرض العمود',
  },
  // الشجرة
  tree: {
    empty: 'لا توجد بيانات',
  },
  // التحديد الشجري
  treeSelect: {
    triggerLabel: 'التحديد الشجري',
  },
  // صندوق النقل
  transfer: {
    sourceTitle: 'القائمة الأولى',
    targetTitle: 'القائمة الثانية',
    moveRight: 'نقل إلى اليمين',
    moveLeft: 'نقل إلى اليسار',
    searchPlaceholder: 'اكتب للبحث',
    empty: 'لا توجد بيانات',
  },
  // الرفع
  upload: {
    select: 'اختيار ملف',
    drag: 'اسحب الملفات إلى هنا، أو انقر للرفع',
    list: 'قائمة الملفات',
    remove: 'إزالة',
    fail: 'فشل الرفع',
    exceedSize: 'الملف يتجاوز حدّ الحجم',
    exceedCount: 'يتجاوز حدّ العدد',
    rejectType: 'نوع الملف غير مسموح',
  },
  // الارتساء
  anchor: {
    label: 'تنقل الارتساء',
  },

  // نصوص إمكانية الوصول (aria-label / إعلانات قارئ الشاشة، تستخدمها طبقات UI عبر t('ariaLabels.xxx'))
  ariaLabels: {
    close: 'إغلاق',
    expand: 'توسيع',
    collapse: 'طي',
    clear: 'مسح',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    openDropdown: 'فتح القائمة المنسدلة',
    closeDropdown: 'طي القائمة المنسدلة',
    openDialog: 'فتح مربع الحوار',
    closeDialog: 'إغلاق مربع الحوار',
    openMenu: 'فتح القائمة',
    closeMenu: 'طي القائمة',
    previous: 'السابق',
    next: 'التالي',
    previousMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي',
    previousYear: 'السنة السابقة',
    nextYear: 'السنة التالية',
    selectDate: 'اختيار التاريخ',
    selectTime: 'اختيار الوقت',
    hour: 'الساعة',
    minute: 'الدقيقة',
    second: 'الثانية',
    page: 'الصفحة {page}',
    currentPage: 'الصفحة الحالية، الصفحة {page}',
    previousPage: 'الصفحة السابقة',
    nextPage: 'الصفحة التالية',
    currentStep: 'الخطوة الحالية، الخطوة {step}: {title}',
    step: 'الخطوة {step}',
    loading: 'جارٍ التحميل',
    upload: 'رفع',
    uploading: 'جارٍ الرفع',
    uploadSuccess: 'تم الرفع بنجاح',
    uploadFailed: 'فشل الرفع',
    removeFile: 'إزالة الملف',
    previewImage: 'معاينة الصورة',
    previousImage: 'الصورة السابقة',
    nextImage: 'الصورة التالية',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    rotate: 'تدوير',
    reset: 'إعادة تعيين',
    switchOn: 'مفعّل',
    switchOff: 'غير مفعّل',
    rating: 'التقييم',
    stars: '{n} نجوم',
    sortAscending: 'ترتيب تصاعدي',
    sortDescending: 'ترتيب تنازلي',
    sort: 'فرز',
    selectAll: 'تحديد الكل',
    partialSelected: 'محدّد جزئيًا',
    moveToTarget: 'نقل إلى اليمين',
    moveToSource: 'نقل إلى اليسار',
    search: 'بحث',
    empty: 'لا توجد بيانات',
    saturation: 'التشبع',
    hue: 'تدرج اللون',
    alpha: 'التعتيم',
    removeTag: 'إزالة الوسم',
  },
} as const;
