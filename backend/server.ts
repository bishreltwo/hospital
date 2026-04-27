import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Жишээ өгөгдөл (Ирээдүйд ХУР/ДАН болон Database-ээс ирнэ)
const mockPatientData = {
  regNumber: "АА99010123",
  lastName: "Бат",
  firstName: "Болд",
  age: 25,
  gender: "Эрэгтэй",
  bloodType: "A(II)+",
  history: [
    { date: "2026-04-10", diagnosis: "Грипп", hospital: "Улсын 1-р эмнэлэг" },
    { date: "2026-03-15", diagnosis: "Хоолойн үрэвсэл", hospital: "Интермед" }
  ]
};

// Өвчтөний мэдээлэл авах API endpoint
app.get('/api/patient/:id', (req, res) => {
  // Бодит байдал дээр энд ДАН-аар баталгаажсан ID-г шалгана
  res.json(mockPatientData);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend сервер http://localhost:${PORT} дээр ажиллаж байна`);
});