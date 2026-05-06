import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('1234', 10)

  const patient = await prisma.patient.upsert({
    where: { regNumber: 'XX12345678' },
    update: { password: hashedPassword },
    create: {
      regNumber: 'XX12345678',
      firstName: 'Болд',
      lastName: 'Бат',
      familyName: 'Батын',
      birthDate: '1992-05-14',
      age: 32,
      gender: 'male',
      height: 175,
      weight: 72,
      bloodType: 'B+',
      password: hashedPassword,
      records: {
        create: [
          { diagnosis: 'Томуу', hospital: 'Улаанбаатар Эмнэлэг', date: '2024-01-15', status: 'done', gender: 'both', type: 'history' },
          { diagnosis: 'Даралт ихсэх', hospital: 'НЭМС', date: '2024-06-20', status: 'ongoing', gender: 'both', type: 'history' },
          { diagnosis: 'Гэдэсний хагалгаа', hospital: 'Гэрэл эмнэлэг', date: '2023-11-05', status: 'done', gender: 'male', type: 'surgery' },
          { diagnosis: 'Цусны ерөнхий шинжилгээ', hospital: 'Лаб центр', date: '2024-03-10', status: 'done', gender: 'both', type: 'lab' },
          { diagnosis: 'Элэгний шинжилгээ', hospital: 'НЭМС', date: '2026-04-20', status: 'ongoing', gender: 'both', type: 'lab' },
          { diagnosis: 'Амоксициллин 500мг', hospital: 'Улаанбаатар Эмнэлэг', date: '2024-01-15', status: 'done', gender: 'both', type: 'prescription' },
          { diagnosis: 'Метформин 850мг', hospital: 'НЭМС', date: '2024-06-20', status: 'ongoing', gender: 'both', type: 'prescription' },
        ]
      },
      notifications: {
        create: [
          { message: 'Томуугийн оношилгоо шинэчлэгдлээ — НЭМС эмнэлэг', read: false },
          { message: 'Шинэ жорын бичиг бэлэн боллоо', read: false },
          { message: 'Шинжилгээний хариу ирлээ', read: true },
        ]
      }
    }
  })

  console.log('✅ Seed амжилттай — нууц үг hash хийгдлээ:', patient.firstName, patient.lastName)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
