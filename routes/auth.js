const router = require('express').Router();
const User = require('../models/user'); // (متأكد إنها 'user' سمول زي ما صلحناها)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// (جديد) استدعاء المكتبة الجديدة
const { body, validationResult } = require('express-validator');

// ---------------------------------
// (جديد) قواعد التحقق للتسجيل
// ---------------------------------
const registerValidationRules = [
  // 1. الاسم: مينفعش يبقى فاضي، ولازم يكون 3 حروف عالأقل
  body('name')
    .trim() // يشيل المسافات الزايدة
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long.'),

  // 2. الإيميل: لازم يكون إيميل سليم
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(), // (ده بينضف الإيميل وبيخليه كله lowercase)

  // 3. التليفون: مينفعش يبقى فاضي
  body('phone')
    .notEmpty().withMessage('Phone number is required.'),

  // 4. الباسورد: لازم يكون 6 حروف عالأقل
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

  // 5. تأكيد الباسورد: لازم يطابق الباسورد
  body('repassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password.');
      }
      return true; // (معناه إن الشرط نجح)
    })
];

// ---------------------------------
// (جديد) قواعد التحقق للدخول
// ---------------------------------
const loginValidationRules = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
];


// ---------------------------------
// API: Register (مُعدل بالكامل)
// ---------------------------------
router.post('/register', registerValidationRules, async (req, res) => {
  
  // (جديد) الخطوة 1: شوف فيه أخطاء تحقق ولا لأ
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // (ده الرد الاحترافي اللي زي الصورة)
    // (بتاعنا أحسن لأنه بيرجع "قايمة" بكل الأخطاء مش خطأ واحد)
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed. Please check your input.',
      errors: errors.array() // (هنا كل الأخطاء بالتفصيل)
    });
  }

  // (جديد) الخطوة 2: لو مفيش أخطاء، كمل عادي
  // (هنا بنشيل الـ if statements القديمة لأننا عملناها فوق)
  const { name, email, phone, password } = req.body;

  try {
    // الخطوة 3: نتأكد من الإيميل والتليفون (دي لازم يدوي)
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'This email is already in use.'
        // (ممكن نرجعها بنفس شكل الـ array)
        // errors: [{ type: 'field', msg: 'This email is already in use.', path: 'email', location: 'body'}]
      });
    }

    const phoneExists = await User.findOne({ phone: phone });
    if (phoneExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'This phone number is already in use.'
        // errors: [{ type: 'field', msg: 'This phone number is already in use.', path: 'phone', location: 'body'}]
      });
    }
    
    // الخطوة 4: (زي ما هي) نشفر الباسورد ونحفظ اليوزر
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword 
    });

    const savedUser = await user.save();
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: { userId: savedUser._id }
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred.',
      error: err.message
    });
  }
});


// ---------------------------------
// API: Login (مُعدل بالكامل)
// ---------------------------------
router.post('/login', loginValidationRules, async (req, res) => {
  
  // (جديد) الخطوة 1: شوف فيه أخطاء تحقق ولا لأ
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed. Please check your input.',
      errors: errors.array()
    });
  }

  // الخطوة 2: كمل عادي
  const { email, password } = req.body;

  try {
    // 3. نتأكد إن الإيميل موجود
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid credentials. Please check email and password.'
      });
    }

    // 4. نقارن الباسورد
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid credentials. Please check email and password.'
      });
    }

    // 5. نعمل التوكن
    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.TOKEN_SECRET,
      { expiresIn: '24h' }
    ); 
    
    // 6. نرجع الرد
    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token: token,
        user: { id: user._id, name: user.name, email: user.email }
      }
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred.',
      error: err.message
    });
  }
});


module.exports = router;