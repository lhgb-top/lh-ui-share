export default {
  // 通用
  common: {
    loading: '加载中',
  },
  // 输入组件
  input: {
    placeholder: '请输入',
    password: '密码',
  },
  // 日期组件（预留）
  datepicker: {
    now: '此刻',
    today: '今天',
    prevMonth: '上一月',
    nextMonth: '下一月',
    placeholder: '请选择日期',
    cancel: '取消',
    clear: '清除',
    confirm: '确定',
    dateTableConfirm: '确认',
    dateTableDeConfirm: '暂不确定',
    panelLabel: '选择日期',
    monthPanelLabel: '选择月份',
    yearPanelLabel: '选择年份',
    year: '年',
    month: '月',
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
  // 时间选择器
  timepicker: {
    now: '此刻',
    placeholder: '请选择时间',
    confirm: '确定',
    cancel: '取消',
    hour: '时',
    minute: '分',
    second: '秒',
    panelLabel: '选择时间',
    hourLabel: '小时',
    minuteLabel: '分钟',
    secondLabel: '秒',
  },
  // 级联选择器
  cascader: {
    noMatch: '无匹配数据',
    placeholder: '请选择',
    panelLabel: '请选择级联选项',
    columnLabel: '第 {n} 级',
  },
  // 标签
  tag: {
    close: '关闭',
  },
  // 徽章
  badge: {
    other: '其他',
  },
  // 选择器
  select: {
    noMatch: '无匹配数据',
    noData: '暂无数据',
    placeholder: '请选择',
  },
  // 表单
  form: {
    validateFailed: '校验失败',
    required: '此项为必填',
  },
  // 切换
  switch: {
    on: '开',
    off: '关',
  },
  // 滑块
  slider: {
    range: '范围',
    thumb: '滑块',
    thumbStart: '起始滑块',
    thumbEnd: '结束滑块',
  },
  // 进度条
  progress: {
    percent: '%',
  },
  // 头像
  avatar: {
    icon: '用户图标',
  },
  // 描述列表
  descriptions: {
    operation: '操作',
  },
  // 空状态
  empty: {
    description: '暂无数据',
  },
  // 警告提示
  alert: {
    close: '关闭警告',
  },
  // 对话框
  dialog: {
    close: '关闭对话框',
  },
  // 提示消息
  message: {
    close: '关闭提示',
  },
  // 面包屑
  breadcrumb: {
    label: '面包屑导航',
    more: '更多',
  },
  // 分页
  pagination: {
    total: '共 {total} 条',
    prev: '上一页',
    next: '下一页',
    page: '第 {page} 页',
    goto: '前往',
    pageSuffix: '页',
    sizeChanger: '{size} 条/页',
    sizeChangerLabel: '每页条数',
  },
  // 标签页
  tabs: {
    add: '新增标签页',
  },
  // 步骤条
  steps: {
    step: '第 {index} 步',
    finish: '已完成',
    error: '出错',
  },
  // 气泡确认
  popconfirm: {
    confirm: '确定',
    cancel: '取消',
  },
  // 抽屉
  drawer: {
    title: '抽屉',
    close: '关闭抽屉',
  },
  // 通知
  notification: {
    close: '关闭通知',
    closeAll: '全部关闭',
  },
  // 加载
  loading: {
    text: '加载中…',
  },

  // 折叠面板
  collapse: {
    toggle: '展开或折叠 {title}',
  },
  // 评分
  rate: {
    stars: '{n} 星',
  },
  // 返回顶部
  backtop: {
    label: '返回顶部',
  },
  // 图片
  image: {
    preview: '预览图片',
    error: '加载失败',
    zoomIn: '放大',
    zoomOut: '缩小',
    rotate: '旋转',
    prev: '上一张',
    next: '下一张',
    close: '关闭图片预览',
  },

  // 导航菜单
  menu: {
    submenuLabel: '子菜单 {title}',
  },

  // 表格
  table: {
    empty: '暂无数据',
    filterTitle: '筛选',
    filterConfirm: '确定',
    filterReset: '重置',
    resizeLabel: '调整列宽',
  },
  // 树
  tree: {
    empty: '暂无数据',
  },
  // 树选择
  treeSelect: {
    triggerLabel: '树选择',
  },
  // 穿梭框
  transfer: {
    sourceTitle: '列表一',
    targetTitle: '列表二',
    moveRight: '移到右侧',
    moveLeft: '移到左侧',
    searchPlaceholder: '请输入搜索内容',
    empty: '暂无数据',
  },
  // 上传
  upload: {
    select: '选择文件',
    drag: '将文件拖到此处，或点击上传',
    list: '文件列表',
    remove: '移除',
    fail: '上传失败',
    exceedSize: '文件超出大小限制',
    exceedCount: '超出数量限制',
    rejectType: '文件类型不允许',
  },
  // 锚点
  anchor: {
    label: '锚点导航',
  },

  // 无障碍文案（aria-label / 读屏播报用，供各 UI 层经 t('ariaLabels.xxx') 取用）
  ariaLabels: {
    close: '关闭',
    expand: '展开',
    collapse: '收起',
    clear: '清除',
    confirm: '确定',
    cancel: '取消',
    openDropdown: '打开下拉',
    closeDropdown: '收起下拉',
    openDialog: '打开对话框',
    closeDialog: '关闭对话框',
    openMenu: '打开菜单',
    closeMenu: '收起菜单',
    previous: '上一项',
    next: '下一项',
    previousMonth: '上一月',
    nextMonth: '下一月',
    previousYear: '上一年',
    nextYear: '下一年',
    selectDate: '选择日期',
    selectTime: '选择时间',
    hour: '小时',
    minute: '分钟',
    second: '秒',
    page: '第 {page} 页',
    currentPage: '当前页，第 {page} 页',
    previousPage: '上一页',
    nextPage: '下一页',
    currentStep: '当前步骤，第 {step} 步：{title}',
    step: '第 {step} 步',
    loading: '加载中',
    upload: '上传',
    uploading: '上传中',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    removeFile: '移除文件',
    previewImage: '预览图片',
    previousImage: '上一张图片',
    nextImage: '下一张图片',
    zoomIn: '放大',
    zoomOut: '缩小',
    rotate: '旋转',
    reset: '重置',
    switchOn: '已开启',
    switchOff: '已关闭',
    rating: '评分',
    stars: '{n} 星',
    sortAscending: '升序排列',
    sortDescending: '降序排列',
    sort: '排序',
    selectAll: '全选',
    partialSelected: '部分选中',
    moveToTarget: '移到右侧',
    moveToSource: '移到左侧',
    search: '搜索',
    empty: '暂无数据',
  },
} as const;