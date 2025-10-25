// 1. استدعاء المكتبات
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors'); // استدعاء مكتبة cors
const authRoutes = require('./routes/auth'); 

// 2. تشغيل إكسبريس
const app = express();
// Vercel بيحدد البورت لوحده، مش محتاجين السطر ده

// 3. تفعيل cors (لازم يكون قبل الروتس)
app.use(cors()); 

// 4. عشان نفهم JSON
app.use(express.json());

// 5. تحديد المسار الرئيسي للـ APIs
app.use('/api/auth', authRoutes); 

// 6. روت ترحيبي للمسار الرئيسي
app.get('/', (req, res) => {
  res.send('API is running successfully on Vercel!');
});

// ---------------------------------
// 7. راوت مخصوص للتأكد من المتغيرات (للتجربة)
app.get('/debug-vars', (req, res) => {
  console.log('--- DEBUGGING ENV VARS ---');
  console.log('DB_CONNECT_VALUE:', process.env.DB_CONNECT);
  console.log('TOKEN_SECRET_VALUE:', process.env.TOKEN_SECRET ? 'SET' : 'NOT SET');
  console.log('----------------------------');
  
  // هنرجع أول 30 حرف بس عشان نتأكد
  res.status(200).json({
    message: 'Debug info sent to Vercel logs.',
    db_connect_preview: process.env.DB_CONNECT ? process.env.DB_CONNECT.substring(0, 30) + '...' : 'NOT SET'
  });
});
// ---------------------------------

// 8. الاتصال بالداتابيز (مرة واحدة)
mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح!'))
  .catch((err) => console.error('!!!!!! فشل الاتصال بالداتابيز:', err));

// 9. تصدير التطبيق لـ Vercel
module.exports = app;