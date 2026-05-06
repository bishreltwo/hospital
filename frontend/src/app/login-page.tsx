"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ register: '', password: '' })
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!form.register || !form.password) {
      setError('Бүх талбарыг бөглөнө үү')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ register: form.register, password: form.password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('patientId', data.patientId)
        router.push('/dashboard')
      } else {
        setError(data.message || 'Нэвтрэх мэдээлэл буруу байна')
      }
    } catch {
      setError('Сервертэй холбогдоход алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a56db 0%, #0a2f7a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>
            🏥
          </div>
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 700, margin: 0 }}>
            Smart Clinic
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', marginTop: '8px' }}>
            Нэгдсэн Эмнэлгийн Систем
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2744', margin: '0 0 24px' }}>
            Нэвтрэх
          </h2>

          {/* Регистрийн дугаар */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7eb8', display: 'block', marginBottom: '8px' }}>
              Регистрийн дугаар
            </label>
            <input
              type="text"
              placeholder="АА12345678"
              value={form.register}
              onChange={e => setForm({ ...form, register: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e3ecfc',
                borderRadius: '12px',
                fontSize: '15px',
                color: '#1a2744',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f5f8ff'
              }}
            />
          </div>

          {/* Нууц үг */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7eb8', display: 'block', marginBottom: '8px' }}>
              Нууц үг
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #e3ecfc',
                borderRadius: '12px',
                fontSize: '15px',
                color: '#1a2744',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f5f8ff'
              }}
            />
          </div>

          {/* Алдаа */}
          {error && (
            <div style={{
              background: '#fff0f0',
              border: '1px solid #ffd0d0',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#c0392b',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Нэвтрэх товч */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#93b4f0' : '#1a56db',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>

          {/* ДАН */}
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e3ecfc',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7eb8', margin: '0 0 12px' }}>
              эсвэл
            </p>
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: '#f5f8ff',
                color: '#1a56db',
                border: '1.5px solid #1a56db',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ДАН системээр нэвтрэх
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
