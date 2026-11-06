/**
 * Русский: полный перевод
 */
export default {
  // Общее
  common: {
    loading: 'Загрузка',
  },
  // Поле ввода
  input: {
    placeholder: 'Введите',
    password: 'Пароль',
    clear: 'Очистить',
  },
  // Компонент выбора даты (зарезервировано)
  datepicker: {
    now: 'Сейчас',
    today: 'Сегодня',
    prevMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    placeholder: 'Выберите дату',
    cancel: 'Отмена',
    clear: 'Очистить',
    confirm: 'OK',
    dateTableConfirm: 'Подтвердить',
    dateTableDeConfirm: 'Пока нет',
    panelLabel: 'Выберите дату',
    monthPanelLabel: 'Выберите месяц',
    yearPanelLabel: 'Выберите год',
    year: 'г.',
    month: 'м.',
    // Заголовок панели календаря: {month} — уже сокращённое название месяца (например, «окт.»),
    // шаблон задаёт только порядок и разделитель года и месяца
    panelTitle: '{month} {year}',
    month1: 'янв.',
    month2: 'февр.',
    month3: 'март',
    month4: 'апр.',
    month5: 'май',
    month6: 'июнь',
    month7: 'июль',
    month8: 'авг.',
    month9: 'сент.',
    month10: 'окт.',
    month11: 'нояб.',
    month12: 'дек.',
    weeks: {
      sun: 'вс',
      mon: 'пн',
      tue: 'вт',
      wed: 'ср',
      thu: 'чт',
      fri: 'пт',
      sat: 'сб',
    },
    months: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  },
  // Компонент выбора времени
  timepicker: {
    now: 'Сейчас',
    placeholder: 'Выберите время',
    confirm: 'OK',
    cancel: 'Отмена',
    hour: 'ч',
    minute: 'м',
    second: 'с',
    panelLabel: 'Выберите время',
    hourLabel: 'Час',
    minuteLabel: 'Минута',
    secondLabel: 'Секунда',
  },
  // Каскадный селектор
  cascader: {
    noMatch: 'Нет подходящих данных',
    placeholder: 'Выберите',
    panelLabel: 'Выберите элемент каскада',
    columnLabel: 'Уровень {n}',
    filter: 'Поиск',
  },
  // Тег
  tag: {
    close: 'Закрыть',
  },
  // Бейдж
  badge: {
    other: 'Прочее',
  },
  // Селектор
  select: {
    noMatch: 'Нет подходящих данных',
    noData: 'Нет данных',
    placeholder: 'Выберите',
    clear: 'Очистить',
    filter: 'Поиск',
    empty: 'Нет совпадений',
  },
  // Автодополнение
  autocomplete: {
    label: 'Автодополнение',
    noMatch: 'Нет совпадений',
    noData: 'Нет данных',
    placeholder: 'Введите',
    clear: 'Очистить',
  },
  // Упоминания
  mentions: {
    label: 'Упоминания',
    noMatch: 'Нет совпадающих участников',
    placeholder: 'Введите @, чтобы упомянуть участника',
  },
  // Текст
  text: {
    copy: 'Копировать',
    copied: 'Скопировано',
  },
  // 颜色选择器
  colorPicker: {
    label: 'Выбор цвета',
    placeholder: 'Выберите цвет',
    inputLabel: 'Значение цвета',
  },
  // 标签输入
  inputTag: {
    label: 'Ввод тегов',
    placeholder: 'Введите тег и нажмите Enter',
    removeTag: 'Удалить тег',
  },
  // Форма
  form: {
    validateFailed: 'Проверка не пройдена',
    required: 'Обязательное поле',
  },
  // Переключатель
  switch: {
    on: 'Вкл',
    off: 'Выкл',
  },
  // Ползунок
  slider: {
    range: 'Диапазон',
    thumb: 'Ползунок',
    thumbStart: 'Начальный ползунок',
    thumbEnd: 'Конечный ползунок',
  },
  // Индикатор прогресса
  progress: {
    percent: '%',
  },
  // Аватар
  avatar: {
    icon: 'Иконка пользователя',
  },
  // Список описаний
  descriptions: {
    operation: 'Действие',
  },
  // Пустое состояние
  empty: {
    description: 'Нет данных',
  },
  // Предупреждение
  alert: {
    close: 'Закрыть предупреждение',
  },
  // Диалоговое окно
  dialog: {
    close: 'Закрыть диалог',
    confirm: 'OK',
    cancel: 'Отмена',
    ariaLabel: 'Диалог',
  },
  // Сообщение
  message: {
    close: 'Закрыть сообщение',
  },
  // Хлебные крошки
  breadcrumb: {
    label: 'Хлебные крошки',
    more: 'Ещё',
  },
  // Пагинация
  pagination: {
    total: 'Всего: {total}',
    prev: 'Предыдущая страница',
    next: 'Следующая страница',
    page: 'Страница {page}',
    goto: 'Перейти',
    pageSuffix: 'стр.',
    sizeChanger: '{size} / стр.',
    sizeChangerLabel: 'Элементов на странице',
  },
  // Вкладки
  tabs: {
    add: 'Добавить вкладку',
  },
  // Шаги
  steps: {
    step: 'Шаг {index}',
    finish: 'Завершено',
    error: 'Ошибка',
  },
  // Всплывающее подтверждение
  popconfirm: {
    confirm: 'OK',
    cancel: 'Отмена',
  },
  // Выдвижная панель
  drawer: {
    title: 'Выдвижная панель',
    close: 'Закрыть панель',
  },
  // Уведомление
  notification: {
    close: 'Закрыть уведомление',
    closeAll: 'Закрыть всё',
  },
  // Загрузка
  loading: {
    text: 'Загрузка…',
  },

  // Сворачиваемая панель
  collapse: {
    toggle: 'Развернуть или свернуть {title}',
  },
  // Оценка
  rate: {
    stars: '{n} звёзд',
  },
  // Возврат наверх
  backtop: {
    label: 'Вернуться наверх',
  },
  // Изображение
  image: {
    preview: 'Просмотр изображения',
    error: 'Ошибка загрузки',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    rotate: 'Повернуть',
    prev: 'Предыдущее',
    next: 'Следующее',
    close: 'Закрыть просмотр изображения',
  },

  // Меню навигации
  menu: {
    submenuLabel: 'Подменю {title}',
  },

  // Таблица
  table: {
    empty: 'Нет данных',
    filterTitle: 'Фильтр',
    filterConfirm: 'OK',
    filterReset: 'Сбросить',
    resizeLabel: 'Изменить ширину столбца',
  },
  // Дерево
  tree: {
    empty: 'Нет данных',
  },
  // Выбор из дерева
  treeSelect: {
    triggerLabel: 'Выбор из дерева',
  },
  // Трансфер
  transfer: {
    sourceTitle: 'Список 1',
    targetTitle: 'Список 2',
    moveRight: 'Переместить вправо',
    moveLeft: 'Переместить влево',
    searchPlaceholder: 'Введите для поиска',
    empty: 'Нет данных',
  },
  // Загрузка файлов
  upload: {
    select: 'Выбрать файл',
    drag: 'Перетащите файлы сюда или нажмите для загрузки',
    list: 'Список файлов',
    remove: 'Удалить',
    fail: 'Ошибка загрузки',
    exceedSize: 'Превышен допустимый размер файла',
    exceedCount: 'Превышено допустимое количество',
    rejectType: 'Тип файла не разрешён',
  },
  // Якоря
  anchor: {
    label: 'Якорная навигация',
  },

  // Тексты доступности (aria-label / объявление скринридера, используются слоями UI через t('ariaLabels.xxx'))
  ariaLabels: {
    close: 'Закрыть',
    expand: 'Развернуть',
    collapse: 'Свернуть',
    clear: 'Очистить',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    openDropdown: 'Открыть выпадающий список',
    closeDropdown: 'Свернуть выпадающий список',
    openDialog: 'Открыть диалог',
    closeDialog: 'Закрыть диалог',
    openMenu: 'Открыть меню',
    closeMenu: 'Свернуть меню',
    previous: 'Предыдущий элемент',
    next: 'Следующий элемент',
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    previousYear: 'Предыдущий год',
    nextYear: 'Следующий год',
    selectDate: 'Выбрать дату',
    selectTime: 'Выбрать время',
    hour: 'Час',
    minute: 'Минута',
    second: 'Секунда',
    page: 'Страница {page}',
    currentPage: 'Текущая страница, страница {page}',
    previousPage: 'Предыдущая страница',
    nextPage: 'Следующая страница',
    currentStep: 'Текущий шаг, шаг {step}: {title}',
    step: 'Шаг {step}',
    loading: 'Загрузка',
    upload: 'Загрузить',
    uploading: 'Загрузка…',
    uploadSuccess: 'Загрузка завершена',
    uploadFailed: 'Ошибка загрузки',
    removeFile: 'Удалить файл',
    previewImage: 'Просмотр изображения',
    previousImage: 'Предыдущее изображение',
    nextImage: 'Следующее изображение',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    rotate: 'Повернуть',
    reset: 'Сбросить',
    switchOn: 'Включено',
    switchOff: 'Выключено',
    rating: 'Оценка',
    stars: '{n} звёзд',
    sortAscending: 'Сортировка по возрастанию',
    sortDescending: 'Сортировка по убыванию',
    sort: 'Сортировка',
    selectAll: 'Выбрать всё',
    partialSelected: 'Выбрано частично',
    moveToTarget: 'Переместить вправо',
    moveToSource: 'Переместить влево',
    search: 'Поиск',
    empty: 'Нет данных',
    saturation: 'Насыщенность',
    hue: 'Оттенок',
    alpha: 'Прозрачность',
    removeTag: 'Удалить тег',
  },
} as const;
