/**
 * 日本語 (Japanese)
 * 完全な日本語翻訳（英語フォールバックなし）。
 * src/locales/locale.ts に登録、src/constants/index.ts に整理済み、
 * `lhlocale.setLocale('ja-JP')` で切り替えて使用可能。
 */
export default {
  // 共通
  common: {
    loading: '読み込み中',
  },
  // 入力コンポーネント
  input: {
    placeholder: '入力してください',
    password: 'パスワード',
    clear: 'クリア',
  },
  // 日付ピッカー（予約）
  datepicker: {
    now: '現在',
    today: '今日',
    prevMonth: '前の月',
    nextMonth: '翌月',
    placeholder: '日付を選択',
    cancel: 'キャンセル',
    clear: 'クリア',
    confirm: '確定',
    dateTableConfirm: '確認',
    dateTableDeConfirm: '後で決める',
    panelLabel: '日付を選択',
    monthPanelLabel: '月を選択',
    yearPanelLabel: '年を選択',
    year: '年',
    month: '月',
    // カレンダーパネルタイトル：{month} はすでに「10月」のような単位付きの名称、テンプレートは年と月の順序と接続辞のみを担当
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
      mon: '月',
      tue: '火',
      wed: '水',
      thu: '木',
      fri: '金',
      sat: '土',
    },
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  // タイムピッカー
  timepicker: {
    now: '現在',
    placeholder: '時間を選択',
    confirm: '確定',
    cancel: 'キャンセル',
    hour: '時',
    minute: '分',
    second: '秒',
    panelLabel: '時間を選択',
    hourLabel: '時間',
    minuteLabel: '分',
    secondLabel: '秒',
  },
  // カスケードセレクター
  cascader: {
    noMatch: '該当するデータがありません',
    placeholder: '選択してください',
    panelLabel: 'カスケードオプションを選択',
    columnLabel: '第{n}階層',
    filter: '検索',
  },
  // タグ
  tag: {
    close: '閉じる',
  },
  // バッジ
  badge: {
    other: 'その他',
  },
  // セレクター
  select: {
    noMatch: '該当するデータがありません',
    noData: 'データがありません',
    placeholder: '選択してください',
    clear: 'クリア',
    filter: '検索',
    empty: '一致なし',
  },
  // オートコンプリート
  autocomplete: {
    label: 'オートコンプリート',
    noMatch: '一致するデータがありません',
    noData: 'データがありません',
    placeholder: '入力してください',
    clear: 'クリア',
  },
  // メンション
  mentions: {
    label: 'メンション',
    noMatch: '一致するメンバーがいません',
    placeholder: '入力してください。@ でメンバー',
  },
  // テキスト
  text: {
    copy: 'コピー',
    copied: 'コピーしました',
  },
  // 颜色选择器
  colorPicker: {
    label: 'カラーピッカー',
    placeholder: '色を選択',
    inputLabel: '色値',
  },
  // 标签输入
  inputTag: {
    label: 'タグ入力',
    placeholder: 'タグを入力して Enter',
    removeTag: 'タグを削除',
  },
  // フォーム
  form: {
    validateFailed: '検証に失敗しました',
    required: 'この項目は必須です',
  },
  // トグル
  switch: {
    on: 'オン',
    off: 'オフ',
  },
  // スライダー
  slider: {
    range: '範囲',
    thumb: 'スライダー',
    thumbStart: '開始スライダー',
    thumbEnd: '終了スライダー',
  },
  // プログレスバー
  progress: {
    percent: '%',
  },
  // アバター
  avatar: {
    icon: 'ユーザーアイコン',
  },
  // ディスクリプション
  descriptions: {
    operation: '操作',
  },
  // 空の状態
  empty: {
    description: 'データがありません',
  },
  // アラート
  alert: {
    close: 'アラートを閉じる',
  },
  // ダイアログ
  dialog: {
    close: 'ダイアログを閉じる',
    confirm: '確定',
    cancel: 'キャンセル',
    ariaLabel: 'ダイアログ',
  },
  // メッセージ
  message: {
    close: 'メッセージを閉じる',
  },
  // パンくず
  breadcrumb: {
    label: 'パンくずナビゲーション',
    more: 'もっと見る',
  },
  // ページネーション
  pagination: {
    total: '合計 {total} 件',
    prev: '前のページ',
    next: '次のページ',
    page: '第{page}ページ',
    goto: '移動',
    pageSuffix: 'ページ',
    sizeChanger: '{size} 件/ページ',
    sizeChangerLabel: 'ページあたりの件数',
  },
  // タブ
  tabs: {
    add: 'タブを追加',
  },
  // ステップ
  steps: {
    step: 'ステップ {index}',
    finish: '完了',
    error: 'エラー',
  },
  // ポップコンファーム
  popconfirm: {
    confirm: '確定',
    cancel: 'キャンセル',
  },
  // ドロワー
  drawer: {
    title: 'ドロワー',
    close: 'ドロワーを閉じる',
  },
  // 通知
  notification: {
    close: '通知を閉じる',
    closeAll: 'すべて閉じる',
  },
  // ローディング
  loading: {
    text: '読み込み中…',
  },

  // 折りたたみパネル
  collapse: {
    toggle: '{title} を展開または折りたたむ',
  },
  // 評価
  rate: {
    stars: '{n}つ星',
  },
  // トップに戻る
  backtop: {
    label: 'トップに戻る',
  },
  // 画像
  image: {
    preview: '画像をプレビュー',
    error: '読み込みに失敗しました',
    zoomIn: '拡大',
    zoomOut: '縮小',
    rotate: '回転',
    prev: '前の画像',
    next: '次の画像',
    close: '画像プレビューを閉じる',
  },

  // ナビゲーションメニュー
  menu: {
    submenuLabel: 'サブメニュー {title}',
  },

  // テーブル
  table: {
    empty: 'データがありません',
    filterTitle: 'フィルター',
    filterConfirm: '確認',
    filterReset: 'リセット',
    resizeLabel: '列幅を調整',
  },
  // ツリー
  tree: {
    empty: 'データがありません',
  },
  // ツリーセレクト
  treeSelect: {
    triggerLabel: 'ツリーセレクト',
  },
  // トランスファー
  transfer: {
    sourceTitle: 'リスト1',
    targetTitle: 'リスト2',
    moveRight: '右に移動',
    moveLeft: '左に移動',
    searchPlaceholder: '検索キーワードを入力',
    empty: 'データがありません',
  },
  // アップロード
  upload: {
    select: 'ファイルを選択',
    drag: 'ここにファイルをドラッグするか、クリックしてアップロード',
    list: 'ファイルリスト',
    remove: '削除',
    fail: 'アップロードに失敗しました',
    exceedSize: 'ファイルサイズが上限を超えています',
    exceedCount: 'ファイル数が上限を超えています',
    rejectType: '許可されていないファイル形式です',
  },
  // アンカー
  anchor: {
    label: 'アンカーナビゲーション',
  },

  // アクセシビリティラベル（aria-label / スクリーンリーダー読み上げ用、各 UI 層が t('ariaLabels.xxx') で参照）
  ariaLabels: {
    close: '閉じる',
    expand: '展開',
    collapse: '折りたたむ',
    clear: 'クリア',
    confirm: '確定',
    cancel: 'キャンセル',
    openDropdown: 'ドロップダウンを開く',
    closeDropdown: 'ドロップダウンを閉じる',
    openDialog: 'ダイアログを開く',
    closeDialog: 'ダイアログを閉じる',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    previous: '前の項目',
    next: '次の項目',
    previousMonth: '前の月',
    nextMonth: '翌月',
    previousYear: '前年',
    nextYear: '翌年',
    selectDate: '日付を選択',
    selectTime: '時間を選択',
    hour: '時間',
    minute: '分',
    second: '秒',
    page: '第{page}ページ',
    currentPage: '現在のページ、第{page}ページ',
    previousPage: '前のページ',
    nextPage: '次のページ',
    currentStep: '現在のステップ、ステップ {step}：{title}',
    step: 'ステップ {step}',
    loading: '読み込み中',
    upload: 'アップロード',
    uploading: 'アップロード中',
    uploadSuccess: 'アップロード成功',
    uploadFailed: 'アップロード失敗',
    removeFile: 'ファイルを削除',
    previewImage: '画像をプレビュー',
    previousImage: '前の画像',
    nextImage: '次の画像',
    zoomIn: '拡大',
    zoomOut: '縮小',
    rotate: '回転',
    reset: 'リセット',
    switchOn: 'オン',
    switchOff: 'オフ',
    rating: '評価',
    stars: '{n}つ星',
    sortAscending: '昇順で並べ替え',
    sortDescending: '降順で並べ替え',
    sort: '並べ替え',
    selectAll: 'すべて選択',
    partialSelected: '一部選択済み',
    moveToTarget: '右に移動',
    moveToSource: '左に移動',
    search: '検索',
    empty: 'データがありません',
    saturation: '彩度',
    hue: '色相',
    alpha: '不透明度',
    removeTag: 'タグを削除',
  },
} as const;
