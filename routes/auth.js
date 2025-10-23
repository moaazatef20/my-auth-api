const router = require('express').Router();
const User = require('../models/user'); // هنجيب الموديل اللي لسه عاملينه
const bcrypt = require('bcryptjs'); // مكتبة تشفير الباسورد
const jwt = require('jsonwebtoken'); // مكتبة التوكن

// ---------------------------------
// API: التسجيل (Sign Up / Register) - (نسخة محدثة)
// ---------------------------------
router.post('/register', async (req, res) => {

  console.log('!!! === ريكويست تسجيل جديد وصل === !!!'); // <--- السطر الجديد

  // 1. (جديد) نتأكد إن الباسورد متطابق
  if (req.body.password !== req.body.repassword) {
    return res.status(400).send('كلمة السر وتأكيدها غير متطابقين');
  }

  // 2. نتأكد إن الإيميل مش متسجل قبل كده
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).send('هذا الإيميل مسجل بالفعل');
  }

  // 3. (جديد) نتأكد إن رقم التليفون مش متسجل قبل كده
  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (phoneExists) {
    return res.status(400).send('رقم الهاتف هذا مسجل بالفعل');
  }

  // 4. تشفير الباسورد (Hashing)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // 5. إنشاء يوزر جديد (مع إضافة التليفون)
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone, // (سطر جديد)
    password: hashedPassword 
  });

  try {
    // 6. حفظ اليوزر في الداتابيز
    const savedUser = await user.save();
    res.status(201).send({ userId: savedUser._id }); // نرجع رسالة نجاح
  } catch (err) {
    res.status(400).send(err);
  }
});


// ---------------------------------
// API: تسجيل الدخول (Login)
// ---------------------------------
router.post('/login', async (req, res) => {
  
  // 1. نتأكد إن الإيميل موجود
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send('الإيميل أو الباسورد خطأ');
  }

  // 2. نقارن الباسورد اللي جالنا بالباسورد المتشفر في الداتابيز
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(400).send('الإيميل أو الباسورد خطأ');
  }

  // 3. (أهم خطوة) لو كله تمام: نعمل "توكن" (JWT)
  // التوكن ده هو "تصريح الدخول" اللي الـ Front-end هيستخدمه بعد كده
  // لازم نعمل "سر" (Secret) للتوكن ده. هنحطه في ملف .env
  const token = jwt.sign(
    { _id: user._id, name: user.name }, // دي البيانات اللي هنخزنها جوه التوكن
    process.env.TOKEN_SECRET // ده المفتاح السري بتاعنا
  ); 
  
  // 4. نرجع التوكن للـ Front-end
  res.header('auth-token', token).send({ token: token });
});


module.exports = router;