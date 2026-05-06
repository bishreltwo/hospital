"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface HistoryItem {
  id: number
  diagnosis: string
  hospital: string
  date: string
  status: 'done' | 'ongoing'
  gender: 'male' | 'female' | 'both'
  type: 'history' | 'surgery' | 'lab' | 'prescription'
}

interface Notification {
  id: number
  message: string
  date: string
  read: boolean
}

interface PatientData {
  regNumber: string
  firstName: string
  lastName: string
  familyName: string
  age: number
  birthDate: string
  gender: 'male' | 'female'
  height: number
  weight: number
  bloodType: string
  history: HistoryItem[]
  notifications: Notification[]
}

type MenuType = 'dashboard' | 'history' | 'surgery' | 'lab' | 'prescription'

const MENU_ITEMS: { key: MenuType; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Нүүр', icon: '🏠' },
  { key: 'history', label: 'Өвчний түүх', icon: '📋' },
  { key: 'surgery', label: 'Хагалгааны түүх', icon: '🔬' },
  { key: 'lab', label: 'Шинжилгээ', icon: '🧪' },
  { key: 'prescription', label: 'Жорын бичиг', icon: '💊' },
]

const STATUS_LABEL = { done: 'Хийгдсэн', ongoing: 'Хийгдэж байгаа' }
const STATUS_COLOR = { done: '#16a34a', ongoing: '#d97706' }
const STATUS_BG = { done: '#f0fdf4', ongoing: '#fffbeb' }

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<MenuType>('dashboard')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const patientId = localStorage.getItem('patientId') || '1'
    if (!token) { router.push('/'); return }

    fetch(`http://localhost:5000/api/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.status === 401) { router.push('/'); return null } return res.json() })
      .then(d => { if (d) { setData(d); setNotifications(d.notifications || []) } })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('patientId')
    router.push('/')
  }

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f6ff', fontSize: '18px', color: '#1a56db', fontFamily: 'sans-serif' }}>
      Уншиж байна...
    </div>
  )
  if (!data) return null

  const filteredItems = (type: MenuType) => {
    if (type === 'dashboard') return []
    return data.history.filter(h => {
      const typeMatch = h.type === type
      const genderMatch = genderFilter === 'all' || h.gender === 'both' || h.gender === genderFilter
      return typeMatch && genderMatch
    })
  }

  const renderMenuContent = () => {
    if (activeMenu === 'dashboard') return renderDashboard()
    const items = filteredItems(activeMenu)
    const menuInfo = MENU_ITEMS.find(m => m.key === activeMenu)!

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2744', margin: 0 }}>
            {menuInfo.icon} {menuInfo.label}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ key: 'all', label: 'Бүгд' }, { key: 'male', label: '👨 Эрэгтэй' }, { key: 'female', label: '👩 Эмэгтэй' }].map(f => (
              <button key={f.key} onClick={() => setGenderFilter(f.key as typeof genderFilter)}
                style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: genderFilter === f.key ? '#1a56db' : '#e8f0fe', color: genderFilter === f.key ? 'white' : '#1a56db' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7eb8', fontSize: '15px', background: 'white', borderRadius: '16px', border: '1px solid #e3ecfc' }}>
            Мэдээлэл байхгүй байна
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e3ecfc', boxShadow: '0 2px 8px rgba(26,86,219,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>
                    {menuInfo.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a2744', fontSize: '15px' }}>{item.diagnosis}</div>
                    <div style={{ fontSize: '13px', color: '#6b7eb8', marginTop: '3px' }}>{item.hospital}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#1a56db', fontWeight: 500, background: '#e8f0fe', padding: '4px 10px', borderRadius: '8px' }}>{item.date}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: STATUS_COLOR[item.status], background: STATUS_BG[item.status], padding: '4px 10px', borderRadius: '8px', border: `1px solid ${STATUS_COLOR[item.status]}40` }}>
                    {STATUS_LABEL[item.status]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#1a56db', borderRadius: '20px', padding: '28px 32px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', flexShrink: 0 }}>
          {data!.lastName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', opacity: 0.75, marginBottom: '4px' }}>Өвчтөн</div>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>{data!.familyName} овогтой {data!.lastName} {data!.firstName}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>Регистр: {data!.regNumber}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 20px', fontSize: '22px', fontWeight: 700 }}>{data!.bloodType}</div>
          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Цусны бүлэг</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e3ecfc', boxShadow: '0 2px 16px rgba(26,86,219,0.07)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a56db', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Үндсэн мэдээлэл</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Ургийн овог', value: data!.familyName },
            { label: 'Овог', value: data!.lastName },
            { label: 'Нэр', value: data!.firstName },
            { label: 'Төрсөн огноо', value: data!.birthDate },
            { label: 'Нас', value: `${data!.age} нас` },
            { label: 'Хүйс', value: data!.gender === 'male' ? '👨 Эрэгтэй' : '👩 Эмэгтэй' },
            { label: 'Өндөр', value: `${data!.height} см` },
            { label: 'Жин', value: `${data!.weight} кг` },
            { label: 'Цусны бүлэг', value: data!.bloodType, highlight: true },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f5f8ff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e3ecfc' }}>
              <div style={{ fontSize: '11px', color: '#6b7eb8', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: (item as any).highlight ? '#1a56db' : '#1a2744' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e3ecfc', boxShadow: '0 2px 16px rgba(26,86,219,0.07)' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a56db', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Сүүлийн эмнэлгийн түүх</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data!.history.slice(0, 3).map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f5f8ff', borderRadius: '12px', border: '1px solid #e3ecfc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', flexShrink: 0 }}>+</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1a2744', fontSize: '14px' }}>{item.diagnosis}</div>
                  <div style={{ fontSize: '12px', color: '#6b7eb8', marginTop: '2px' }}>{item.hospital}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ fontSize: '12px', color: '#1a56db', fontWeight: 500, background: '#e8f0fe', padding: '4px 10px', borderRadius: '8px' }}>{item.date}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: STATUS_COLOR[item.status], background: STATUS_BG[item.status], padding: '3px 8px', borderRadius: '6px' }}>{STATUS_LABEL[item.status]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f6ff', fontFamily: "'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1a56db', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Logo + нэр */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/logo.jpg" alt="logo" width={36} height={36} style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '17px' }}>
            <span style={{ color: '#00d4ff' }}>MEDI NOVA</span> TECH
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '18px', position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '48px', background: 'white', borderRadius: '16px', width: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #e3ecfc', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e3ecfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1a2744', fontSize: '15px' }}>Мэдэгдэл</span>
                  {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: '12px', color: '#1a56db', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Бүгдийг уншсан</button>}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b7eb8', fontSize: '14px' }}>Мэдэгдэл байхгүй</div>
                ) : notifications.map(n => (
                  <div key={n.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f0f6ff', background: n.read ? 'white' : '#f0f6ff' }}>
                    <div style={{ fontSize: '14px', color: '#1a2744', fontWeight: n.read ? 400 : 600 }}>
                      {!n.read && <span style={{ color: '#1a56db', marginRight: '6px' }}>●</span>}
                      {n.message}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7eb8', marginTop: '4px' }}>{n.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>{data.lastName} {data.firstName}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>
            Гарах
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '220px', background: 'white', borderRight: '1px solid #e3ecfc', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          {MENU_ITEMS.map(item => (
            <button key={item.key} onClick={() => setActiveMenu(item.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: 'none', background: activeMenu === item.key ? '#1a56db' : 'transparent', color: activeMenu === item.key ? 'white' : '#1a2744', fontSize: '14px', fontWeight: activeMenu === item.key ? 600 : 400, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }} onClick={() => showNotifications && setShowNotifications(false)}>
          {renderMenuContent()}
        </main>
      </div>
    </div>
  )
}
