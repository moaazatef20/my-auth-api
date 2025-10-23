// 1. استدعاء المكتبات
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const authRoutes = require('./routes/auth'); 

// 2. تشغيل إكسبريس
const app = express();
const PORT = process.env.PORT || 3000;

// 3. عشان نفهم JSON
app.use(express.json());

// 4. تحديد المسار الرئيسي للـ APIs
app.use('/api/auth', authRoutes); 

// 5. (الأهم) الاتصال بالداتابيز أولاً
mongoose.connect(process.env.DB_CONNECT)
  .then(() => {
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
    
    // 6. (جديد) تشغيل السيرفر *بعد* نجاح الاتصال
    app.listen(PORT, () => {
      console.log(`السيرفر شغال على http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('!!!!!!!!!! فشل الاتصال بالداتابيز !!!!!!!!!!!');
    console.error(err);
  });