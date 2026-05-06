import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = express()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'medinovatech_secret_2026'

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.options('*', cors())

// Validation schemas
const loginSchema = z.object({
  register: z.string().min(5, 'Регистр хэт богино байна').max(20, 'Регистр хэт урт байна'),
  password: z.string().min(4, 'Нууц үг хамгийн багадаа 4 тэмдэгт байна'),
})

// JWT middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Нэвтрэх шаардлагатай' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { patientId: number }
    ;(req as any).patientId = decoded.patientId
    next()
  } catch {
    res.status(401).json({ message: 'Token хүчингүй байна' })
  }
}

app.get('/', (req, res) => {
  res.send('🏥 Medi Nova Tech API')
})

// Login
app.post('/api/auth/login', async (req, res) => {
  // Validation
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ message: result.error.errors[0].message })
    return
  }

  const { register, password } = result.data

  try {
    const patient = await prisma.patient.findUnique({ where: { regNumber: register } })

    if (!patient) {
      res.status(401).json({ message: 'Регистр эсвэл нууц үг буруу байна' })
      return
    }

    // Bcrypt шалгах
    const isValid = await bcrypt.compare(password, patient.password)
    if (!isValid) {
      res.status(401).json({ message: 'Регистр эсвэл нууц үг буруу байна' })
      return
    }

    const token = jwt.sign({ patientId: patient.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, patientId: String(patient.id), message: 'Амжилттай нэвтэрлээ' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Серверийн алдаа' })
  }
})

// Өвчтөний мэдээлэл
app.get('/api/patient/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id)
  const requesterId = (req as any).patientId

  if (isNaN(id)) {
    res.status(400).json({ message: 'ID буруу байна' })
    return
  }

  if (id !== requesterId) {
    res.status(403).json({ message: 'Хандах эрхгүй' })
    return
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        records: true,
        notifications: { orderBy: { createdAt: 'desc' } }
      }
    })

    if (!patient) {
      res.status(404).json({ message: 'Өвчтөн олдсонгүй' })
      return
    }

    res.json({
      regNumber: patient.regNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      familyName: patient.familyName,
      birthDate: patient.birthDate,
      age: patient.age,
      gender: patient.gender,
      height: patient.height,
      weight: patient.weight,
      bloodType: patient.bloodType,
      history: patient.records.map(r => ({
        id: r.id,
        diagnosis: r.diagnosis,
        hospital: r.hospital,
        date: r.date,
        status: r.status,
        gender: r.gender,
        type: r.type,
      })),
      notifications: patient.notifications.map(n => ({
        id: n.id,
        message: n.message,
        date: n.createdAt.toISOString().split('T')[0],
        read: n.read,
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Серверийн алдаа' })
  }
})

// Notification уншсан болгох
app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) {
    res.status(400).json({ message: 'ID буруу байна' })
    return
  }
  try {
    await prisma.notification.update({ where: { id }, data: { read: true } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Серверийн алдаа' })
  }
})

app.listen(5000, () => {
  console.log('🚀 Medi Nova Tech API: http://localhost:5000')
})
