const router = require('express').Router();
const User = require('../models/User'); // (Make sure 'U' is capitalized)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------------------------
// API: Register
// ---------------------------------
router.post('/register', async (req, res) => {
  
  // 1. Validate: Password match
  if (req.body.password !== req.body.repassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password and confirmation password do not match.'
    });
  }

  // 2. Validate: Check if email is already in use
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).json({
      status: 'fail',
      message: 'This email is already in use.'
    });
  }

  // 3. Validate: Check if phone number is already in use
  const phoneExists = await User.findOne({ phone: req.body.phone });
  if (phoneExists) {
    return res.status(400).json({
      status: 'fail',
      message: 'This phone number is already in use.'
    });
  }

  // If all validations pass, proceed to create user
  try {
    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 5. Create a new user instance
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword 
    });

    // 6. Save the user to the database
    const savedUser = await user.save();
    
    // 7. Send success response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: {
        userId: savedUser._id
      }
    });

  } catch (err) {
    // 8. Handle server errors
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred.',
      error: err.message
    });
  }
});


// ---------------------------------
// API: Login
// ---------------------------------
router.post('/login', async (req, res) => {
  
  try {
    // 1. Check if user exists (by email)
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // (Security) Send a generic message
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid credentials. Please check email and password.'
      });
    }

    // 2. Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      // (Security) Send the *same* generic message
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid credentials. Please check email and password.'
      });
    }

    // 3. If credentials are valid, create and assign a token
    const token = jwt.sign(
      { _id: user._id, name: user.name }, // Payload
      process.env.TOKEN_SECRET,
      { expiresIn: '24h' } // (Good practice) Make the token expire
    ); 
    
    // 4. Send success response with token and user data
    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });

  } catch (err) {
    // 5. Handle server errors
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred.',
      error: err.message
    });
  }
});


module.exports = router;