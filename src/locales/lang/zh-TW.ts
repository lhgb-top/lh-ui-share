/**
 * 繁體中文（zh-TW）：由 zh-CN 轉換 + 兩岸 IT 用詞對照
 */
export default {
  // 通用
  common: {
    loading: '載入中',
  },
  // 輸入元件
  input: {
    placeholder: '請輸入',
    password: '密碼',
  },
  // 日期元件（預留）
  datepicker: {
    now: '此刻',
    today: '今天',
    prevMonth: '上一月',
    nextMonth: '下一月',
    placeholder: '請選擇日期',
    cancel: '取消',
    clear: '清除',
    confirm: '確定',
    dateTableConfirm: '確認',
    dateTableDeConfirm: '暫不確定',
    panelLabel: '選擇日期',
    monthPanelLabel: '選擇月份',
    yearPanelLabel: '選擇年份',
    year: '年',
    month: '月',
    // 日曆面板標題：{month} 已是「10月」這類帶單位的名，模板只負責年和月的順序與連接符
    panelTitle: '{year}年{month}',
    month1: '1月',
    month2: '2月',
    month3: '3月',
    month4: '4月',
    month5: '5月',
    month6: '6月',
    month7: '7月',
    month8: '8月',
    month9: '9月',
    month10: '10月',
    month11: '11月',
    month12: '12月',
    weeks: {
      sun: '日',
      mon: '一',
      tue: '二',
      wed: '三',
      thu: '四',
      fri: '五',
      sat: '六',
    },
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  // 時間選擇器
  timepicker: {
    now: '此刻',
    placeholder: '請選擇時間',
    confirm: '確定',
    cancel: '取消',
    hour: '時',
    minute: '分',
    second: '秒',
    panelLabel: '選擇時間',
    hourLabel: '小時',
    minuteLabel: '分鐘',
    secondLabel: '秒',
  },
  // 級聯選擇器
  cascader: {
    noMatch: '無匹配資料',
    placeholder: '請選擇',
    panelLabel: '請選擇級聯選項',
    columnLabel: '第 {n} 級',
  },
  // 標籤
  tag: {
    close: '關閉',
  },
  // 徽章
  badge: {
    other: '其他',
  },
  // 選擇器
  select: {
    noMatch: '無匹配資料',
    noData: '暫無資料',
    placeholder: '請選擇',
  },
  // 表單
  form: {
    validateFailed: '校驗失敗',
    required: '此項為必填',
  },
  // 切換
  switch: {
    on: '開',
    off: '關',
  },
  // 滑塊
  slider: {
    range: '範圍',
    thumb: '滑塊',
    thumbStart: '起始滑塊',
    thumbEnd: '結束滑塊',
  },
  // 進度條
  progress: {
    percent: '%',
  },
  // 頭像
  avatar: {
    icon: '使用者圖示',
  },
  // 描述列表
  descriptions: {
    operation: '操作',
  },
  // 空狀態
  empty: {
    description: '暫無資料',
  },
  // 警告提示
  alert: {
    close: '關閉警告',
  },
  // 對話框
  dialog: {
    close: '關閉對話框',
  },
  // 提示消息
  message: {
    close: '關閉提示',
  },
  // 麵包屑
  breadcrumb: {
    label: '麵包屑導航',
    more: '更多',
  },
  // 分頁
  pagination: {
    total: '共 {total} 筆',
    prev: '上一頁',
    next: '下一頁',
    page: '第 {page} 頁',
    goto: '前往',
    pageSuffix: '頁',
    sizeChanger: '{size} 筆/頁',
    sizeChangerLabel: '每頁筆數',
  },
  // 標籤頁
  tabs: {
    add: '新增標籤頁',
  },
  // 步驟條
  steps: {
    step: '第 {index} 步',
    finish: '已完成',
    error: '出錯',
  },
  // 氣泡確認
  popconfirm: {
    confirm: '確定',
    cancel: '取消',
  },
  // 抽屜
  drawer: {
    title: '抽屜',
    close: '關閉抽屜',
  },
  // 通知
  notification: {
    close: '關閉通知',
    closeAll: '全部關閉',
  },
  // 載入
  loading: {
    text: '載入中…',
  },

  // 折疊面板
  collapse: {
    toggle: '展開或折疊 {title}',
  },
  // 評分
  rate: {
    stars: '{n} 星',
  },
  // 傳回頂部
  backtop: {
    label: '傳回頂部',
  },
  // 圖片
  image: {
    preview: '預覽圖片',
    error: '載入失敗',
    zoomIn: '放大',
    zoomOut: '縮小',
    rotate: '旋轉',
    prev: '上一張',
    next: '下一張',
    close: '關閉圖片預覽',
  },

  // 導覽菜單
  menu: {
    submenuLabel: '子菜單 {title}',
  },

  // 表格
  table: {
    empty: '暫無資料',
    filterTitle: '篩選',
    filterConfirm: '確定',
    filterReset: '重置',
    resizeLabel: '調整列寬',
  },
  // 樹
  tree: {
    empty: '暫無資料',
  },
  // 樹選擇
  treeSelect: {
    triggerLabel: '樹選擇',
  },
  // 穿梭框
  transfer: {
    sourceTitle: '列表一',
    targetTitle: '列表二',
    moveRight: '移到右側',
    moveLeft: '移到左側',
    searchPlaceholder: '請輸入搜尋內容',
    empty: '暫無資料',
  },
  // 上傳
  upload: {
    select: '選擇檔案',
    drag: '將檔案拖到此處，或點選上傳',
    list: '檔案列表',
    remove: '移除',
    fail: '上傳失敗',
    exceedSize: '檔案超出大小限制',
    exceedCount: '超出數量限制',
    rejectType: '檔案類型不允許',
  },
  // 錨點
  anchor: {
    label: '錨點導航',
  },

  // 無障礙文案（aria-label / 讀屏播報用，供各 UI 層經 t('ariaLabels.xxx') 取用）
  ariaLabels: {
    close: '關閉',
    expand: '展開',
    collapse: '收起',
    clear: '清除',
    confirm: '確定',
    cancel: '取消',
    openDropdown: '開啟下拉',
    closeDropdown: '收起下拉',
    openDialog: '開啟對話框',
    closeDialog: '關閉對話框',
    openMenu: '開啟菜單',
    closeMenu: '收起菜單',
    previous: '上一項',
    next: '下一項',
    previousMonth: '上一月',
    nextMonth: '下一月',
    previousYear: '上一年',
    nextYear: '下一年',
    selectDate: '選擇日期',
    selectTime: '選擇時間',
    hour: '小時',
    minute: '分鐘',
    second: '秒',
    page: '第 {page} 頁',
    currentPage: '當前頁，第 {page} 頁',
    previousPage: '上一頁',
    nextPage: '下一頁',
    currentStep: '當前步驟，第 {step} 步：{title}',
    step: '第 {step} 步',
    loading: '載入中',
    upload: '上傳',
    uploading: '上傳中',
    uploadSuccess: '上傳成功',
    uploadFailed: '上傳失敗',
    removeFile: '移除檔案',
    previewImage: '預覽圖片',
    previousImage: '上一張圖片',
    nextImage: '下一張圖片',
    zoomIn: '放大',
    zoomOut: '縮小',
    rotate: '旋轉',
    reset: '重置',
    switchOn: '已開啟',
    switchOff: '已關閉',
    rating: '評分',
    stars: '{n} 星',
    sortAscending: '升序排列',
    sortDescending: '降序排列',
    sort: '排序',
    selectAll: '全選',
    partialSelected: '部分選中',
    moveToTarget: '移到右側',
    moveToSource: '移到左側',
    search: '搜尋',
    empty: '暫無資料',
  },
} as const;
