// 챗봇 메시지 응답 설정의 상수·기본값·헬퍼 — HailMary ChatMessagePage 에서 추출
//
// 각 step 은 아래 형태의 messageConfig 를 가진다. ChatMessageConfig 가 편집하고
// ChatMessagePreview 가 렌더링한다.

export const PH = {
  title: '제목 텍스트',
  body: '본문 텍스트',
  accordion: '아코디언 펼침 시 보일 텍스트',
  mainLabel: '메인 버튼',
  subLabel: '서브 버튼',
  quickItem: '퀵 버튼',
}

export const FILE_CAPTION = '* Jpg, Jpeg 형식 지원 (최대 10MB)'

export const ACTION_TYPES = [
  { value: 'single', label: '단일 메시지' },
  { value: 'carousel', label: '캐로셀 메시지' },
  { value: 'inputForm', label: '입력 폼 메시지' },
  { value: 'rag', label: 'RAG 메시지' },
  { value: 'branch', label: '분기 연결' },
]

export const FORM_TYPES = [
  { value: 'textfield', label: 'String (Textfield)', hasOptions: false, hasGuide: true, sampleDesc: '휴대폰 번호', samplePlaceholder: '휴대폰 번호를 입력해 주세요.' },
  { value: 'textarea', label: 'String (Textarea)', hasOptions: false, hasGuide: true, sampleDesc: '주관식 의견', samplePlaceholder: '의견을 남겨주세요.' },
  { value: 'date', label: 'Date (단일 선택)', hasOptions: false, hasGuide: true, sampleDesc: '예약일', samplePlaceholder: '날짜 선택' },
  { value: 'dateRange', label: 'Date (기간 선택)', hasOptions: false, hasGuide: true, sampleDesc: '예약 기간', samplePlaceholder: '기간 선택' },
  { value: 'datetime', label: 'Date time (단일 선택)', hasOptions: false, hasGuide: true, hasTime: true, sampleDesc: '예약 일시', samplePlaceholder: '날짜 선택', sampleTimePlaceholder: '시간 선택' },
  { value: 'selectSingle', label: 'Select (단일 선택)', hasOptions: true, hasGuide: true, sampleDesc: '항목', samplePlaceholder: '항목을 선택해 주세요.' },
  { value: 'selectMulti', label: 'Select (복수 선택)', hasOptions: true, hasGuide: true, sampleDesc: '항목', samplePlaceholder: '항목을 선택해 주세요.' },
  { value: 'checkboxSingle', label: 'Checkbox (단일 선택)', hasOptions: true, hasGuide: false, sampleDesc: '항목', samplePlaceholder: '' },
  { value: 'checkboxMulti', label: 'Checkbox (복수 선택)', hasOptions: true, hasGuide: false, sampleDesc: '항목', samplePlaceholder: '' },
  { value: 'boolean', label: 'Boolean', hasOptions: true, hasGuide: false, sampleDesc: '동의 여부', samplePlaceholder: '' },
  { value: 'number', label: 'Number', hasOptions: false, hasGuide: true, sampleDesc: '예약 인원', samplePlaceholder: '숫자를 입력해 주세요.' },
]

export const defaultFormOptionsFor = (type) => {
  if (type === 'boolean') return [{ id: 1, label: '예' }, { id: 2, label: '아니오' }]
  return [{ id: 1, label: '' }, { id: 2, label: '' }]
}

export const sampleDescFor = (type) => FORM_TYPES.find((t) => t.value === type)?.sampleDesc ?? ''
export const samplePlaceholderFor = (type) => FORM_TYPES.find((t) => t.value === type)?.samplePlaceholder ?? ''
export const sampleTimePlaceholderFor = (type) => FORM_TYPES.find((t) => t.value === type)?.sampleTimePlaceholder ?? ''

export function defaultCarouselCard(id) {
  return {
    id,
    imageOn: true,
    textOn: true,
    titleOn: true,
    bodyOn: true,
    buttonOn: true,
    mainOn: true,
    subOn: true,
    title: '',
    body: '',
    mainLabel: '',
    subLabel: '',
    imageFile: '',
  }
}

/** 새 단계의 메시지 설정 기본값 — 모든 토글 ON 으로 시작 */
export function createDefaultMessageConfig() {
  return {
    cfg: {
      messageOn: true,
      imageOn: true,
      textOn: true,
      titleOn: true,
      bodyOn: true,
      accordionOn: true,
      buttonOn: true,
      mainOn: true,
      subOn: true,
      messageBannerOn: false,
      quickButtonOn: false,
    },
    mode: 'single',
    texts: {
      title: '',
      body: '',
      accordion: '',
      mainLabel: '',
      subLabel: '',
    },
    imageFile: '',
    bannerFile: '',
    quickList: [
      { id: 1, label: '' },
      { id: 2, label: '' },
    ],
    carouselCards: [defaultCarouselCard(1), defaultCarouselCard(2)],
    activeCardIdx: 0,
    form: {
      type: 'textfield',
      description: sampleDescFor('textfield'),
      guideText: samplePlaceholderFor('textfield'),
      timeGuideText: sampleTimePlaceholderFor('textfield'),
      options: defaultFormOptionsFor('textfield'),
    },
  }
}
