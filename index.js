// 1. استدعاء المكتبات
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors'); // (جديد) استدعاء مكتبة cors
const authRoutes = require('./routes/auth'); 

// 2. تشغيل إكسبريس
const app = express();
const PORT = process.env.PORT || 3000;

// (جديد) تفعيل cors
// السطر ده لازم يكون *قبل* الروتس بتاعتك
app.use(cors()); 

// 3. عشان نفهم JSON
app.use(express.json());

// 4. تحديد المسار الرئيسي للـ APIs
app.use('/api/auth', authRoutes); 

// (جديد) روت ترحيبي للمسار الرئيسي
app.get('/', (req, res) => {
  res.send('API is running successfully on Vercel!');
});

// 5. الاتصال بالداتابيز (مرة واحدة)
mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح!'))
  .catch((err) => console.error('!!!!!! فشل الاتصال بالداتابيز:', err));

// 6. تصدير التطبيق لـ Vercel
module.exports = app;