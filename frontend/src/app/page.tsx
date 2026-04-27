"use client"
import { useEffect, useState } from 'react';

export default function PatientDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Backend-ээс мэдээлэл татах
    fetch('http://localhost:5000/api/patient/1')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  if (!data) return <div className="p-10 text-center">Уншиж байна...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Миний Эрүүл Мэнд</h1>
        
        {/* Хувийн мэдээлэл */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Үндсэн мэдээлэл</h2>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="text-gray-500">Регистр:</span> <strong>{data.regNumber}</strong></p>
            <p><span className="text-gray-00">Нэр:</span> <strong>{data.lastName} {data.firstName}</strong></p>
            <p><span className="text-gray-500">Нас:</span> {data.age}</p>
            <p><span className="text-gray-500">Цусны бүлэг:</span> <span className="text-red-600 font-bold">{data.bloodType}</span></p>
          </div>
        </div>

        {/* Өвчний түүх */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Эмнэлгийн түүх</h2>
          <div className="space-y-4">
            {data.history.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                <div>
                  <p className="font-bold">{item.diagnosis}</p>
                  <p className="text-sm text-gray-600">{item.hospital}</p>
                </div>
                <p className="text-sm font-mono text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}