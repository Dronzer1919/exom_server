const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./adminAuth.model');

// Secret key for JWT from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey'; // Fallback if no JWT_SECRET is set

// CREATE a new user
const createUser = async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// LOGIN a user (sign-in)
const loginAdminUser = async (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    user.token = token; // Save token to the user document (optional)
    await user.save();

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Protect routes using JWT authentication middleware
const protectRoute = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Attach user info (userId, role) to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// READ all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// READ a single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE a user by ID
const updateUser = async (req, res) => {
  const { email, password, role } = req.body;
  const userId = req.params.id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (role) user.role = role;

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE a user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Check if email exists
const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ message: 'Email already exists' });
    }
    return res.status(404).json({ message: 'Email available' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { 
  createUser, 
  loginAdminUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  checkEmailExists,
  protectRoute // Don't forget to export the protectRoute middleware
};
