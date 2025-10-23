const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
    unique: true // (تعديل بسيط) نتأكد إن الإيميل ميتكررش
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6
  },
  phone: { // (سطر جديد)
    type: String,
    required: true,
    unique: true // (سطر جديد) نتأكد إن التليفون ميتكررش
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);