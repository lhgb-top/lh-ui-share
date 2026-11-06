/**
 * 한국어 (Korean)
 * 완전한 한국어 번역입니다. 모든 키는 zh-CN.ts와 동일한 구조를 가지며,
 * src/locales/locale.ts에 등록되어 있고 src/constants/index.ts에 명시되어 있어
 * `lhlocale.setLocale('ko-KR')`로 바로 전환할 수 있습니다.
 */
export default {
  // 공통
  common: {
    loading: '불러오는 중',
  },
  // 입력 컴포넌트
  input: {
    placeholder: '입력해 주세요',
    password: '비밀번호',
    clear: '지우기',
  },
  // 날짜 선택기 (예약)
  datepicker: {
    now: '현재',
    today: '오늘',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
    placeholder: '날짜를 선택해 주세요',
    cancel: '취소',
    clear: '지우기',
    confirm: '확인',
    dateTableConfirm: '확인',
    dateTableDeConfirm: '나중에 선택',
    panelLabel: '날짜 선택',
    monthPanelLabel: '월 선택',
    yearPanelLabel: '연도 선택',
    year: '년',
    month: '월',
    // 달력 패널 제목: {month}는 이미 '10월'과 같이 단위가 붙은 이름이며, 템플릿은 연도와 월의 순서와 연결자만 담당합니다
    panelTitle: '{year}년 {month}',
    month1: '1월',
    month2: '2월',
    month3: '3월',
    month4: '4월',
    month5: '5월',
    month6: '6월',
    month7: '7월',
    month8: '8월',
    month9: '9월',
    month10: '10월',
    month11: '11월',
    month12: '12월',
    weeks: {
      sun: '일',
      mon: '월',
      tue: '화',
      wed: '수',
      thu: '목',
      fri: '금',
      sat: '토',
    },
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  },
  // 시간 선택기
  timepicker: {
    now: '현재',
    placeholder: '시간을 선택해 주세요',
    confirm: '확인',
    cancel: '취소',
    hour: '시',
    minute: '분',
    second: '초',
    panelLabel: '시간 선택',
    hourLabel: '시간',
    minuteLabel: '분',
    secondLabel: '초',
  },
  // 단계별 선택기
  cascader: {
    noMatch: '일치하는 데이터가 없습니다',
    placeholder: '선택해 주세요',
    panelLabel: '단계별 옵션을 선택해 주세요',
    columnLabel: '{n}단계',
    filter: '검색',
  },
  // 태그
  tag: {
    close: '닫기',
  },
  // 배지
  badge: {
    other: '기타',
  },
  // 선택기
  select: {
    noMatch: '일치하는 데이터가 없습니다',
    noData: '데이터가 없습니다',
    placeholder: '선택해 주세요',
    clear: '지우기',
    filter: '검색',
    empty: '일치 항목 없음',
  },
  // 자동 완성
  autocomplete: {
    label: '자동 완성',
    noMatch: '일치하는 데이터가 없습니다',
    noData: '데이터가 없습니다',
    placeholder: '입력하세요',
    clear: '지우기',
  },
  // 멘션
  mentions: {
    label: '멘션',
    noMatch: '일치하는 멤버가 없습니다',
    placeholder: '내용을 입력하세요. @로 멤버 언급',
  },
  // 텍스트
  text: {
    copy: '복사',
    copied: '복사됨',
  },
  // 颜色选择器
  colorPicker: {
    label: '색상 선택기',
    placeholder: '색상 선택',
    inputLabel: '색상 값',
  },
  // 标签输入
  inputTag: {
    label: '태그 입력',
    placeholder: '태그를 입력하고 Enter',
    removeTag: '태그 삭제',
  },
  // 폼
  form: {
    validateFailed: '유효성 검사 실패',
    required: '필수 입력 항목입니다',
  },
  // 스위치
  switch: {
    on: '켜짐',
    off: '꺼짐',
  },
  // 슬라이더
  slider: {
    range: '범위',
    thumb: '슬라이더',
    thumbStart: '시작 슬라이더',
    thumbEnd: '끝 슬라이더',
  },
  // 진행률 표시줄
  progress: {
    percent: '%',
  },
  // 아바타
  avatar: {
    icon: '사용자 아이콘',
  },
  // 설명 목록
  descriptions: {
    operation: '작업',
  },
  // 빈 상태
  empty: {
    description: '데이터가 없습니다',
  },
  // 경고
  alert: {
    close: '경고 닫기',
  },
  // 대화상자
  dialog: {
    close: '대화상자 닫기',
    confirm: '확인',
    cancel: '취소',
    ariaLabel: '대화상자',
  },
  // 메시지
  message: {
    close: '메시지 닫기',
  },
  // 이동 경로
  breadcrumb: {
    label: '이동 경로 탐색',
    more: '더보기',
  },
  // 페이지네이션
  pagination: {
    total: '총 {total}개',
    prev: '이전 페이지',
    next: '다음 페이지',
    page: '{page}페이지',
    goto: '이동',
    pageSuffix: '페이지',
    sizeChanger: '{size}개/페이지',
    sizeChangerLabel: '페이지당 개수',
  },
  // 탭
  tabs: {
    add: '탭 추가',
  },
  // 단계
  steps: {
    step: '{index}단계',
    finish: '완료됨',
    error: '오류',
  },
  // 팝오버 확인
  popconfirm: {
    confirm: '확인',
    cancel: '취소',
  },
  // 드로어
  drawer: {
    title: '드로어',
    close: '드로어 닫기',
  },
  // 알림
  notification: {
    close: '알림 닫기',
    closeAll: '모두 닫기',
  },
  // 불러오기
  loading: {
    text: '불러오는 중…',
  },

  // 접기/펼치기
  collapse: {
    toggle: '{title} 펼치기/접기',
  },
  // 평점
  rate: {
    stars: '{n}개의 별',
  },
  // 맨 위로
  backtop: {
    label: '맨 위로',
  },
  // 이미지
  image: {
    preview: '이미지 미리보기',
    error: '불러오기 실패',
    zoomIn: '확대',
    zoomOut: '축소',
    rotate: '회전',
    prev: '이전 이미지',
    next: '다음 이미지',
    close: '이미지 미리보기 닫기',
  },

  // 메뉴
  menu: {
    submenuLabel: '하위 메뉴 {title}',
  },

  // 표
  table: {
    empty: '데이터가 없습니다',
    filterTitle: '필터',
    filterConfirm: '확인',
    filterReset: '초기화',
    resizeLabel: '열 너비 조정',
  },
  // 트리
  tree: {
    empty: '데이터가 없습니다',
  },
  // 트리 선택
  treeSelect: {
    triggerLabel: '트리 선택',
  },
  // 트랜스퍼
  transfer: {
    sourceTitle: '목록 1',
    targetTitle: '목록 2',
    moveRight: '오른쪽으로 이동',
    moveLeft: '왼쪽으로 이동',
    searchPlaceholder: '검색어를 입력해 주세요',
    empty: '데이터가 없습니다',
  },
  // 업로드
  upload: {
    select: '파일 선택',
    drag: '파일을 여기로 끌어다 놓거나 클릭하여 업로드하세요',
    list: '파일 목록',
    remove: '제거',
    fail: '업로드 실패',
    exceedSize: '파일 크기 제한을 초과했습니다',
    exceedCount: '개수 제한을 초과했습니다',
    rejectType: '허용되지 않는 파일 형식입니다',
  },
  // 앵커
  anchor: {
    label: '앵커 탐색',
  },

  // 접근성 라벨 (aria-label / 화면 읽기용, 각 UI 레이어에서 t('ariaLabels.xxx')로 사용)
  ariaLabels: {
    close: '닫기',
    expand: '펼치기',
    collapse: '접기',
    clear: '지우기',
    confirm: '확인',
    cancel: '취소',
    openDropdown: '드롭다운 펼치기',
    closeDropdown: '드롭다운 접기',
    openDialog: '대화상자 열기',
    closeDialog: '대화상자 닫기',
    openMenu: '메뉴 열기',
    closeMenu: '메뉴 접기',
    previous: '이전 항목',
    next: '다음 항목',
    previousMonth: '이전 달',
    nextMonth: '다음 달',
    previousYear: '이전 연도',
    nextYear: '다음 연도',
    selectDate: '날짜 선택',
    selectTime: '시간 선택',
    hour: '시간',
    minute: '분',
    second: '초',
    page: '{page}페이지',
    currentPage: '현재 페이지, {page}페이지',
    previousPage: '이전 페이지',
    nextPage: '다음 페이지',
    currentStep: '현재 단계, {step}단계: {title}',
    step: '{step}단계',
    loading: '불러오는 중',
    upload: '업로드',
    uploading: '업로드 중',
    uploadSuccess: '업로드 성공',
    uploadFailed: '업로드 실패',
    removeFile: '파일 제거',
    previewImage: '이미지 미리보기',
    previousImage: '이전 이미지',
    nextImage: '다음 이미지',
    zoomIn: '확대',
    zoomOut: '축소',
    rotate: '회전',
    reset: '초기화',
    switchOn: '켜짐',
    switchOff: '꺼짐',
    rating: '평점',
    stars: '{n}개의 별',
    sortAscending: '오름차순 정렬',
    sortDescending: '내림차순 정렬',
    sort: '정렬',
    selectAll: '전체 선택',
    partialSelected: '일부 선택됨',
    moveToTarget: '오른쪽으로 이동',
    moveToSource: '왼쪽으로 이동',
    search: '검색',
    empty: '데이터가 없습니다',
    saturation: '채도',
    hue: '색상',
    alpha: '불투명도',
    removeTag: '태그 제거',
  },
} as const;
