const userModel = require('./user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');


// Check if the email already exists in the database
exports.checkEmailExistence = async (req, res) => {
  conso.log(req)
  try {
    const { email } = req.query; // Expecting email in query parameter
    const user = await userModel.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'Email already exists in the database.', status: 'error' });
    }
    res.status(200).json({ msg: 'Email is available.', status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email already exists in the database
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already exists, please try a different one.', status: 'error' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      email: email,
      password: hashedPassword,
    });

    res.status(200).json({ msg: 'User registered successfully', status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
};

// Login user
exports.loginUser = async (req, res) => {
  console.log('hey',req.body)
  try {
    const { email, password } = req.body;
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send('Invalid password');
    }

    const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
    res.status(200).json({ token, status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
};

// Verify user email and send OTP if exists
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists in the database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    
    // Send OTP via email (here you would implement the sending part with nodemailer or a similar service)
    // Example:
    // await sendOtpEmail(user.email, otp);

    res.status(200).json({ msg: 'OTP sent successfully', status: 'success', otp });  // For testing purposes
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending OTP');
  }
};

// (Optional) Send OTP Email - This is a mock function, implement with actual email sending logic
async function sendOtpEmail(email, otp) {
  // Implement with your email sending service (e.g., Nodemailer)
  console.log(`Sending OTP to ${email}: ${otp}`);
}
