// 로그인/회원가입 페이지 — 백엔드 인증(JWT)으로 로그인하고 콘솔로 진입한다.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../design-system/components/Button/Button.jsx'
import Textfield from '../design-system/components/Textfield/Textfield.jsx'
import Typography from '../design-system/components/Typography/Typography.jsx'
import { useTheme } from '../lib/useTheme.js'
import { login, register } from '../lib/auth.js'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === 'register'
  const canSubmit =
    email.trim() && password && (!isRegister || name.trim()) && !submitting

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      if (isRegister) {
        await register(email.trim(), password, name.trim())
      } else {
        await login(email.trim(), password)
      }
      navigate('/app/bots', { replace: true })
    } catch (e) {
      setError(e?.message ?? '요청이 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register')
    setError('')
  }

  return (
    <div className="login">
      <div className="login__card">
        <img
          className="login__logo"
          src={isDark ? '/Infobank_Logo_Color_RGB_White.png' : '/Infobank_Logo_Color_RGB_Black.png'}
          alt="Infobank"
        />
        <Typography variant="headline-1" weight="semibold" as="h1">
          {isRegister ? '회원가입' : '로그인'}
        </Typography>

        <form
          className="login__form"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          {isRegister && (
            <Textfield
              heading="이름"
              required
              placeholder="이름을 입력해 주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Textfield
            heading="이메일"
            required
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Textfield
            heading="비밀번호"
            required
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            status={error ? 'negative' : 'normal'}
            description={error || undefined}
          />
          <Button
            variant="solid"
            color="primary"
            size="large"
            label={submitting ? '처리 중...' : isRegister ? '가입하기' : '로그인'}
            disabled={!canSubmit}
            onClick={submit}
          />
        </form>

        <button type="button" className="login__switch" onClick={switchMode}>
          {isRegister ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </button>
      </div>
    </div>
  )
}
