/**
 * Typography 컴포넌트
 *
 * Props:
 *  variant   — 타이포그래피 스케일
 *              'display-1' | 'display-2' | 'display-3'
 *              'title-1' | 'title-2' | 'title-3'
 *              'heading-1' | 'heading-2'
 *              'headline-1' | 'headline-2'
 *              'body-1-normal' | 'body-1-reading'
 *              'body-2-normal' | 'body-2-reading'
 *              'label-1-normal' | 'label-1-reading' | 'label-2'
 *              'caption-1' | 'caption-2'
 *  weight    — 'bold' | 'semibold' | 'medium' | 'regular'
 *  color     — CSS 변수 or 색상값. 기본: var(--color-label-normal)
 *  as        — 렌더링할 HTML 태그. 기본: 'p'
 *  className — 추가 클래스
 *  children  — 텍스트 내용
 */

const VARIANT_MAP = {
  'display-1':       { size: 'display-1',  lh: 'display-1',       ls: 'display-1'  },
  'display-2':       { size: 'display-2',  lh: 'display-2',       ls: 'display-2'  },
  'display-3':       { size: 'display-3',  lh: 'display-3',       ls: 'display-3'  },
  'title-1':         { size: 'title-1',    lh: 'title-1',         ls: 'title-1'    },
  'title-2':         { size: 'title-2',    lh: 'title-2',         ls: 'title-2'    },
  'title-3':         { size: 'title-3',    lh: 'title-3',         ls: 'title-3'    },
  'heading-1':       { size: 'heading-1',  lh: 'heading-1',       ls: 'heading-1'  },
  'heading-2':       { size: 'heading-2',  lh: 'heading-2',       ls: 'heading-2'  },
  'headline-1':      { size: 'headline-1', lh: 'headline-1',      ls: 'headline-1' },
  'headline-2':      { size: 'headline-2', lh: 'headline-2',      ls: 'headline-2' },
  'body-1-normal':   { size: 'body-1',     lh: 'body-1-normal',   ls: 'body-1'     },
  'body-1-reading':  { size: 'body-1',     lh: 'body-1-reading',  ls: 'body-1'     },
  'body-2-normal':   { size: 'body-2',     lh: 'body-2-normal',   ls: 'body-2'     },
  'body-2-reading':  { size: 'body-2',     lh: 'body-2-reading',  ls: 'body-2'     },
  'label-1-normal':  { size: 'label-1',    lh: 'label-1-normal',  ls: 'label-1'    },
  'label-1-reading': { size: 'label-1',    lh: 'label-1-reading', ls: 'label-1'    },
  'label-2':         { size: 'label-2',    lh: 'label-2',         ls: 'label-2'    },
  'caption-1':       { size: 'caption-1',  lh: 'caption-1',       ls: 'caption-1'  },
  'caption-2':       { size: 'caption-2',  lh: 'caption-2',       ls: 'caption-2'  },
}

export default function Typography({
  variant = 'body-1-normal',
  weight = 'regular',
  color,
  as: Tag = 'p',
  className = '',
  children,
  ...props
}) {
  const map = VARIANT_MAP[variant]

  const style = {
    fontFamily:    'var(--font-family-base)',
    fontSize:      `var(--font-size-${map.size})`,
    lineHeight:    `var(--line-height-${map.lh})`,
    letterSpacing: `var(--letter-spacing-${map.ls})`,
    fontWeight:    `var(--font-weight-${weight})`,
    color:         color ?? 'var(--color-label-normal)',
  }

  return (
    <Tag style={style} className={className} {...props}>
      {children}
    </Tag>
  )
}
