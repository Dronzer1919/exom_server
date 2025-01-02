const express = require('express');
const router = express.Router();
const userController = require('./adminAuth.controller');

// Route to create a new user (Sign Up)
router.post('/create', userController.createUser);

// Route to log in an existing user
router.post('/login', userController.loginAdminUser);

// Protect these routes with authentication middleware
router.get('/all',  userController.getAllUsers);
router.get('/:id', userController.protectRoute, userController.getUserById);
router.put('/update/:id', userController.protectRoute, userController.updateUser);
router.delete('/delete/:id', userController.protectRoute, userController.deleteUser);

// Check if email exists
router.post('/check-email', userController.checkEmailExists);

module.exports = router;
